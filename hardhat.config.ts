import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.7.3",
      },
      {
        version: "0.8.17",
      },
      {
        version: "0.8.0",
      }
    ]
  },
  networks: {
    fork: {
      url: "http://localhost:8545",
    }
  }
};

export default config;
