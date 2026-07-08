// BOT Chain Network Configuration for Tape dApp
// BOT Chain: Layer 1 EVM blockchain with 0.75s blocks, SPoA consensus

export const BOT_CHAIN = {
  chainId: "0x3C8", // 968
  chainName: "BOT Chain Testnet",
  rpcUrls: ["https://rpc.bohr.life"],
  blockExplorerUrls: ["https://scan.bohr.life"],
  nativeCurrency: {
    name: "BOT",
    symbol: "BOT",
    decimals: 18,
  },
  blockTime: 750,
} as const;

export const BOT_CHAIN_MAINNET = {
  chainId: "0x2A5", // 677
  chainName: "BOT Chain",
  rpcUrls: ["https://rpc.botchain.ai"],
  blockExplorerUrls: ["https://scan.botchain.ai"],
  nativeCurrency: {
    name: "BOT",
    symbol: "BOT",
    decimals: 18,
  },
  blockTime: 750,
} as const;

export const CHAIN_CONFIG = {
  rpcUrl: "https://rpc.bohr.life",
  chainId: 968,
  chainIdHex: "0x3C8",
  explorerUrl: "https://scan.bohr.life",
  // No contract is shipped pre-deployed. The address previously hardcoded here
  // (0xFFFC911869A14f2D9d25A05D0CcA3BE7c6135cA8) was an empty STUB with no
  // order-book logic — every read returned zero/empty, which is why the UI
  // looked like mock data. Deploy the real TapeOrderBook from the in-app
  // Deploy panel (browser) or `npm run deploy:testnet` (Hardhat).
  contractAddress: "" as string,
  blockTime: 750,
} as const;

export function getAddChainParams() {
  return {
    method: "wallet_addEthereumChain" as const,
    params: [
      {
        chainId: BOT_CHAIN.chainId,
        chainName: BOT_CHAIN.chainName,
        rpcUrls: BOT_CHAIN.rpcUrls,
        blockExplorerUrls: BOT_CHAIN.blockExplorerUrls,
        nativeCurrency: BOT_CHAIN.nativeCurrency,
      },
    ],
  };
}
