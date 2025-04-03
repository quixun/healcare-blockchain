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
      accounts: ["0x17ef99a6d497fd31aa726860eceeac395578bdfeb5a378d3b894bfa623b51fbd"], // Use an account from Garnacho
    },
  },
};