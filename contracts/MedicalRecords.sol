// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract MedicalRecords is Ownable {
    struct Record {
        string[] cids; // Store multiple CIDs
        address owner; // Owner of the record
        string description; // Description of the record
        mapping(address => uint256) accessExpiry; // Access expiry mapping for doctors
    }

    mapping(string => Record) private records; // Mapping for records by ID
    string[] private recordIdList; // Store all record IDs

    // Events to track record uploads and access granting/revoking
    event RecordUploaded(
        string indexed recordId,
        string[] cids,
        address indexed owner,
        string description
    );
    event AccessGranted(
        string indexed recordId,
        address indexed doctor,
        uint256 expiry
    );
    event AccessRevoked(
        string indexed recordId,
        address indexed doctor,
        uint256 revokedAt
    );

    constructor() Ownable(msg.sender) {}

    // Upload a medical record with multiple CIDs and a description
    function uploadRecord(
        string memory recordId,
        string[] memory _cids,
        string memory _description
    ) external {
        require(bytes(recordId).length > 0, "Record ID cannot be empty");
        require(records[recordId].owner == address(0), "Record already exists");

        Record storage newRecord = records[recordId];
        newRecord.owner = msg.sender;
        newRecord.description = _description;

        for (uint i = 0; i < _cids.length; i++) {
            newRecord.cids.push(_cids[i]);
        }

        recordIdList.push(recordId); // Track the new record ID
        emit RecordUploaded(recordId, _cids, msg.sender, _description);
    }

    // Retrieve a record's CIDs, owner, and description by its ID
    function getRecord(
        string memory recordId
    ) external view returns (string[] memory, address, string memory) {
        require(records[recordId].owner != address(0), "Record not found");

        Record storage rec = records[recordId];
        return (rec.cids, rec.owner, rec.description);
    }

    // Retrieve all records created by a specific owner
    function getRecordsByOwner(
        address _owner
    )
        external
        view
        returns (
            string[] memory recordIds,
            string[][] memory allCids,
            string[] memory descriptions
        )
    {
        uint256 count = 0;
        // First, count how many records belong to _owner
        for (uint i = 0; i < recordIdList.length; i++) {
            if (records[recordIdList[i]].owner == _owner) {
                count++;
            }
        }

        // Initialize arrays to hold the result data
        recordIds = new string[](count);
        allCids = new string[][](count);
        descriptions = new string[](count);

        uint256 index = 0;
        for (uint i = 0; i < recordIdList.length; i++) {
            if (records[recordIdList[i]].owner == _owner) {
                recordIds[index] = recordIdList[i];
                Record storage rec = records[recordIdList[i]];
                allCids[index] = rec.cids;
                descriptions[index] = rec.description;
                index++;
            }
        }
    }

    // Grant access to a doctor for a specific record, with an expiry duration (in seconds)
    function grantAccess(
        string memory recordId,
        address doctor,
        uint256 duration
    ) external {
        require(
            records[recordId].owner == msg.sender,
            "Only owner can grant access"
        );
        require(doctor != address(0), "Invalid doctor address");
        require(duration > 0, "Duration must be greater than zero");

        uint256 existingExpiry = records[recordId].accessExpiry[doctor];
        require(
            existingExpiry == 0 || block.timestamp >= existingExpiry,
            "Doctor already has active access"
        );

        uint256 expiryTime = block.timestamp + duration;
        records[recordId].accessExpiry[doctor] = expiryTime;

        emit AccessGranted(recordId, doctor, expiryTime);
    }

    // Revoke a doctor's access to a record
    function revokeAccess(string memory recordId, address doctor) external {
        require(
            records[recordId].owner == msg.sender,
            "Only owner can revoke access"
        );
        require(doctor != address(0), "Invalid doctor address");

        uint256 expiryTime = records[recordId].accessExpiry[doctor];
        require(expiryTime > 0, "No access granted to this doctor");
        require(block.timestamp < expiryTime, "Access already expired");

        delete records[recordId].accessExpiry[doctor];

        emit AccessRevoked(recordId, doctor, block.timestamp);
    }

    // Check the access expiry time for a specific doctor
    function checkAccessExpiry(
        string memory recordId,
        address doctor
    ) external view returns (uint256) {
        require(records[recordId].owner != address(0), "Record does not exist");
        return records[recordId].accessExpiry[doctor];
    }
}
