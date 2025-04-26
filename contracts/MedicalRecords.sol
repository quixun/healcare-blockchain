// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract MedicalRecords is Ownable {
    struct MedicalRecord {
        // IPFS CIDs
        string[] cids;
        // Patient
        string patientName;
        uint8 patientAge;
        string patientGender;
        // Vitals
        string bloodPressure;
        string heartRate;
        string temperature;
        // Access control & owner
        address owner;
        mapping(address => uint256) accessExpiry;
    }

    mapping(string => MedicalRecord) private records;
    string[] private recordIds; // This array stores all record IDs

    event RecordUploaded(string indexed recordId, address indexed owner);
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

    /// @notice Upload a simplified medical record
    function uploadRecord(
        string memory recordId,
        // IPFS
        string[] memory _cids,
        // Patient
        string memory _name,
        uint8 _age,
        string memory _gender,
        // Vitals
        string memory _bloodPressure,
        string memory _heartRate,
        string memory _temperature
    ) external {
        require(bytes(recordId).length > 0, "ID required");
        require(records[recordId].owner == address(0), "Already exists");

        MedicalRecord storage rec = records[recordId];

        // owner & CIDs
        rec.owner = msg.sender;
        for (uint i = 0; i < _cids.length; i++) {
            rec.cids.push(_cids[i]);
        }

        // patient
        rec.patientName = _name;
        rec.patientAge = _age;
        rec.patientGender = _gender;

        // vitals
        rec.bloodPressure = _bloodPressure;
        rec.heartRate = _heartRate;
        rec.temperature = _temperature;

        // Push recordId to recordIds list
        recordIds.push(recordId);
        emit RecordUploaded(recordId, msg.sender);
    }

    /// @notice Read the simplified record in one call for all records owned by a specific address
    function getRecordsByOwner(
        address _owner
    )
        external
        view
        returns (
            string[] memory ownerRecordIds, // Renamed here to avoid shadowing
            string[][] memory cidsList,
            string[] memory names,
            uint8[] memory ages,
            string[] memory genders,
            string[] memory bloodPressures,
            string[] memory heartRates,
            string[] memory temperatures,
            address[] memory owners
        )
    {
        uint256 count = 0;

        // Count how many records belong to the owner
        for (uint i = 0; i < recordIds.length; i++) {
            if (records[recordIds[i]].owner == _owner) {
                count++;
            }
        }

        // Initialize arrays to hold the result data
        ownerRecordIds = new string[](count); // Renamed here as well
        cidsList = new string[][](count);
        names = new string[](count);
        ages = new uint8[](count);
        genders = new string[](count);
        bloodPressures = new string[](count);
        heartRates = new string[](count);
        temperatures = new string[](count);
        owners = new address[](count);

        uint256 index = 0;
        for (uint i = 0; i < recordIds.length; i++) {
            if (records[recordIds[i]].owner == _owner) {
                MedicalRecord storage rec = records[recordIds[i]];
                ownerRecordIds[index] = recordIds[i]; // Store the correct recordId here
                cidsList[index] = rec.cids;
                names[index] = rec.patientName;
                ages[index] = rec.patientAge;
                genders[index] = rec.patientGender;
                bloodPressures[index] = rec.bloodPressure;
                heartRates[index] = rec.heartRate;
                temperatures[index] = rec.temperature;
                owners[index] = rec.owner;
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

    function getRecordsSharedWithMe(
        address doctor
    )
        external
        view
        returns (
            string[] memory sharedRecordIds,
            string[][] memory cidsList,
            string[] memory names,
            uint8[] memory ages,
            string[] memory genders,
            string[] memory bloodPressures,
            string[] memory heartRates,
            string[] memory temperatures,
            address[] memory owners
        )
    {
        uint256 count = 0;

        for (uint i = 0; i < recordIds.length; i++) {
            MedicalRecord storage rec = records[recordIds[i]];
            if (
                rec.accessExpiry[doctor] > block.timestamp &&
                rec.owner != doctor // Just in case doctors are also patients
            ) {
                count++;
            }
        }

        sharedRecordIds = new string[](count);
        cidsList = new string[][](count);
        names = new string[](count);
        ages = new uint8[](count);
        genders = new string[](count);
        bloodPressures = new string[](count);
        heartRates = new string[](count);
        temperatures = new string[](count);
        owners = new address[](count);

        uint256 index = 0;
        for (uint i = 0; i < recordIds.length; i++) {
            MedicalRecord storage rec = records[recordIds[i]];
            if (
                rec.accessExpiry[doctor] > block.timestamp &&
                rec.owner != doctor
            ) {
                sharedRecordIds[index] = recordIds[i];
                cidsList[index] = rec.cids;
                names[index] = rec.patientName;
                ages[index] = rec.patientAge;
                genders[index] = rec.patientGender;
                bloodPressures[index] = rec.bloodPressure;
                heartRates[index] = rec.heartRate;
                temperatures[index] = rec.temperature;
                owners[index] = rec.owner;
                index++;
            }
        }
    }
}
