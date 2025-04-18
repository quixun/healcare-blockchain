require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.28",
  paths: {
    sources: "./contracts",
  },
  networks: {
    garnacho: {
      url: "http://127.0.0.1:7545", // Make sure this matches your Garnacho RPC URL
      chainId: 1337, // Replace with Garnacho's actual chain ID
      accounts: ["0xcbc1cc407fa5718da98bcfb22f44151e82d14c5554948efa423e776dd53e579b"], // Use an account from Garnacho
    },
  },
};