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

        // Create a new record and assign the current caller as the owner
        Record storage newRecord = records[recordId];
        newRecord.owner = msg.sender;
        newRecord.description = _description; // Set the description

        // Add CIDs to the record
        for (uint i = 0; i < _cids.length; i++) {
            newRecord.cids.push(_cids[i]);
        }

        emit RecordUploaded(recordId, _cids, msg.sender, _description);
    }

    // Retrieve a record's CIDs, owner, and description
    function getRecord(
        string memory recordId
    ) external view returns (string[] memory, address, string memory) {
        require(records[recordId].owner != address(0), "Record not found");

        return (
            records[recordId].cids,
            records[recordId].owner,
            records[recordId].description
        );
    }

    // Grant access to a doctor for a specific record, with an expiry duration
    function grantAccess(
        string memory recordId,
        address doctor,
        uint256 duration // Duration in seconds
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

        emit AccessRevoked(recordId, doctor, block.timestamp); // <-- Missing semicolon here
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
