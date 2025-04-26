require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      viaIR: true, // Enable Intermediate Representation
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: "./contracts",
  },
  networks: {
    garnacho: {
      url: "http://127.0.0.1:7545", // Replace with your Garnacho RPC
      chainId: 1337, // Or the actual chain ID of Garnacho
      accounts: [
        "0xcbc1cc407fa5718da98bcfb22f44151e82d14c5554948efa423e776dd53e579b",
      ],
    },
  },
};