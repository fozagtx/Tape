import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    botchain: {
      url: "https://rpc.botchain.ai",
      chainId: 677,
    },
    "botchain-testnet": {
      url: "https://rpc.bohr.life",
      chainId: 968,
    },
  },
};

export default config;
