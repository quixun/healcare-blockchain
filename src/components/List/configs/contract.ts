export const contractAddress = "0x8edB9dE15Bb0f2c49fB0519472F4C09F559deD0f";

export const MEDICAL_RECORDS_ABI = [
  {
    inputs: [{ internalType: "address", name: "doctor", type: "address" }],
    name: "getRecordsSharedWithMe",
    outputs: [
      { internalType: "string[]", name: "sharedRecordIds", type: "string[]" },
      { internalType: "string[][]", name: "cidsList", type: "string[][]" },
      { internalType: "string[]", name: "names", type: "string[]" },
      { internalType: "uint8[]", name: "ages", type: "uint8[]" },
      { internalType: "string[]", name: "genders", type: "string[]" },
      { internalType: "string[]", name: "bloodPressures", type: "string[]" },
      { internalType: "string[]", name: "heartRates", type: "string[]" },
      { internalType: "string[]", name: "temperatures", type: "string[]" },
      { internalType: "address[]", name: "owners", type: "address[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export const MEDICAL_ALL_RECORDS_ABI = [
  {
    inputs: [{ internalType: "address", name: "_owner", type: "address" }],
    name: "getRecordsByOwner",
    outputs: [
      { internalType: "string[]", name: "ownerRecordIds", type: "string[]" },
      { internalType: "string[][]", name: "cidsList", type: "string[][]" },
      { internalType: "string[]", name: "names", type: "string[]" },
      { internalType: "uint8[]", name: "ages", type: "uint8[]" },
      { internalType: "string[]", name: "genders", type: "string[]" },
      { internalType: "string[]", name: "bloodPressures", type: "string[]" },
      { internalType: "string[]", name: "heartRates", type: "string[]" },
      { internalType: "string[]", name: "temperatures", type: "string[]" },
      { internalType: "address[]", name: "owners", type: "address[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export const UPLOAD_MEDICAL_RECORDS_ABI = [
  {
    inputs: [
      { internalType: "string", name: "recordId", type: "string" },
      { internalType: "string[]", name: "_cids", type: "string[]" },
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "uint8", name: "_age", type: "uint8" },
      { internalType: "string", name: "_gender", type: "string" },
      { internalType: "string", name: "_bloodPressure", type: "string" },
      { internalType: "string", name: "_heartRate", type: "string" },
      { internalType: "string", name: "_temperature", type: "string" },
    ],
    name: "uploadRecord",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export const ACCESS_CONTROL_ABI = [
  {
    inputs: [
      { internalType: "string", name: "recordId", type: "string" },
      { internalType: "address", name: "doctor", type: "address" },
      { internalType: "uint256", name: "duration", type: "uint256" },
    ],
    name: "grantAccess",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "recordId", type: "string" },
      { internalType: "address", name: "doctor", type: "address" },
    ],
    name: "revokeAccess",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "recordId", type: "string" },
      { internalType: "address", name: "doctor", type: "address" },
    ],
    name: "checkAccessExpiry",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

export const HISTORY_TRACKING_ABI = [
  {
    inputs: [{ internalType: "string", name: "recordId", type: "string" }],
    name: "getAccessHistory",
    outputs: [
      {
        components: [
          { internalType: "address", name: "doctor", type: "address" },
          { internalType: "uint256", name: "sharedAt", type: "uint256" },
          { internalType: "uint256", name: "expiresAt", type: "uint256" },
        ],
        internalType: "struct MedicalRecords.AccessLog[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
