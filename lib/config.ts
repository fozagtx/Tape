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
  /** Live TapeOrderBook on BOT Chain Testnet */
  contractAddress: "0x55Fa3C86C38FEE7F3587D883D6300d3243507CF0",
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
