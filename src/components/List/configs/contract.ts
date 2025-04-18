export const contractAddress = "0x4E344d0D4C56Cf6db9C9219582f801E9af25D5FA";

export const MEDICAL_RECORDS_ABI = [
  {
    inputs: [{ internalType: "string", name: "recordId", type: "string" }],
    name: "getRecord",
    outputs: [
      { internalType: "string[]", name: "", type: "string[]" },
      { internalType: "address", name: "", type: "address" },
      { internalType: "string", name: "", type: "string" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export const MEDICAL_ALL_RECORDS_ABI = [
  {
    inputs: [{ internalType: "string", name: "recordId", type: "string" }],
    name: "getRecord",
    outputs: [
      { internalType: "string[]", name: "", type: "string[]" },
      { internalType: "address", name: "", type: "address" },
      { internalType: "string", name: "", type: "string" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_owner", type: "address" }],
    name: "getRecordsByOwner",
    outputs: [
      { internalType: "string[]", name: "", type: "string[]" },
      { internalType: "string[][]", name: "", type: "string[][]" },
      { internalType: "string[]", name: "", type: "string[]" },
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
      { internalType: "string", name: "_description", type: "string" },
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
