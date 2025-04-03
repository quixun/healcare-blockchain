// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract MedicalRecords is Ownable {
    struct Record {
        string cid;
        address owner;
        mapping(address => uint256) accessExpiry;
    }

    mapping(string => Record) private records;

    event RecordUploaded(string indexed cid, address indexed owner);
    event AccessGranted(
        string indexed cid,
        address indexed doctor,
        uint256 expiry
    );
    event AccessRevoked(string indexed cid, address indexed doctor);

    // 👇 Fix: Pass msg.sender to Ownable constructor
    constructor() Ownable(msg.sender) {}

    function uploadRecord(string memory _cid) external {
        records[_cid].cid = _cid;
        records[_cid].owner = msg.sender;
        emit RecordUploaded(_cid, msg.sender);
    }

    function grantAccess(
        string memory _cid,
        address _doctor,
        uint256 _duration
    ) external {
        require(
            records[_cid].owner == msg.sender,
            "Only owner can grant access"
        );
        records[_cid].accessExpiry[_doctor] = block.timestamp + _duration;
        emit AccessGranted(_cid, _doctor, block.timestamp + _duration);
    }

    function revokeAccess(string memory _cid, address _doctor) external {
        require(
            records[_cid].owner == msg.sender,
            "Only owner can revoke access"
        );
        delete records[_cid].accessExpiry[_doctor];
        emit AccessRevoked(_cid, _doctor);
    }

    function hasAccess(
        string memory _cid,
        address _user
    ) external view returns (bool) {
        return
            records[_cid].owner == _user ||
            block.timestamp <= records[_cid].accessExpiry[_user];
    }
}
