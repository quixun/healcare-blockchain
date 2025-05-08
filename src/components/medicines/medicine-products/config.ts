export const contractAddress = "0x9b5b39506E0a7Eb60D82CF0c42dc57D81506465E";

export const ABI_UPLOAD_PRODUCT = [
  {
    inputs: [
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "_imageCID",
        type: "string",
      },
      {
        internalType: "string",
        name: "_brand",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_currentPrice",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_oldPrice",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_rating",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "daysOnSale", // Updated parameter name
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "_isOnSale",
        type: "bool",
      },
    ],
    name: "uploadProduct",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export const ABI_GET_ALL_PRODUCTS = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
    ],
    name: "getProduct",
    outputs: [
      { internalType: "uint256", name: "", type: "uint256" }, // product id
      { internalType: "address", name: "", type: "address" }, // owner address
      { internalType: "string", name: "", type: "string" }, // brand
      { internalType: "string", name: "", type: "string" }, // name
      { internalType: "string", name: "", type: "string" }, // imageCID
      { internalType: "uint256", name: "", type: "uint256" }, // currentPrice
      { internalType: "uint256", name: "", type: "uint256" }, // oldPrice
      { internalType: "uint256", name: "", type: "uint256" }, // rating
      { internalType: "uint256", name: "", type: "uint256" }, // rating
      { internalType: "uint256", name: "", type: "uint256" }, // createdAt
      { internalType: "bool", name: "", type: "bool" }, // isSold
      { internalType: "bool", name: "", type: "bool" }, // isOnSale (this was missing before)
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "productCount",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

export const ABI_BUY_PRODUCT = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
    ],
    name: "buyProduct",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];

export const ABI_UPDATE_PRODUCT = [
  {
    inputs: [
      { internalType: "uint256", name: "_id", type: "uint256" },
      { internalType: "string", name: "_brand", type: "string" },
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "string", name: "_imageCID", type: "string" },
      { internalType: "uint256", name: "_currentPrice", type: "uint256" },
      { internalType: "uint256", name: "_oldPrice", type: "uint256" },
      { internalType: "uint256", name: "_rating", type: "uint256" },
    ],
    name: "updateProductInfo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
