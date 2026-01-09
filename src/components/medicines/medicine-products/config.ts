export const contractAddress = "0x1750fB4e90D1C57569e419F5255EE868B9834D7D";

export const ABI_UPLOAD_PRODUCT = [
  {
    inputs: [
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "string", name: "_imageCID", type: "string" },
      { internalType: "string", name: "_brand", type: "string" },
      { internalType: "uint256", name: "_currentPrice", type: "uint256" },
      { internalType: "uint256", name: "_oldPrice", type: "uint256" },
      { internalType: "uint256", name: "_rating", type: "uint256" },
      { internalType: "uint256", name: "daysOnSale", type: "uint256" },
      { internalType: "bool", name: "_isOnSale", type: "bool" },
      { internalType: "uint256", name: "_quantity", type: "uint256" },
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
      { internalType: "uint256", name: "id", type: "uint256" },
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "string", name: "brand", type: "string" },
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "imageCID", type: "string" },
      { internalType: "uint256", name: "currentPrice", type: "uint256" },
      { internalType: "uint256", name: "oldPrice", type: "uint256" },
      { internalType: "uint256", name: "rating", type: "uint256" },
      { internalType: "uint256", name: "daysOnSale", type: "uint256" },
      { internalType: "uint256", name: "createdAt", type: "uint256" },
      { internalType: "bool", name: "isSold", type: "bool" },
      { internalType: "bool", name: "isOnSale", type: "bool" },
      { internalType: "uint256", name: "quantity", type: "uint256" }, // Added quantity here
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
      { internalType: "uint256", name: "_quantity", type: "uint256" }, // Added quantity here
    ],
    name: "updateProductInfo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];