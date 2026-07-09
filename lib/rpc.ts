import { ethers } from "ethers";
import { CHAIN_CONFIG } from "./config";

/** Prefer a single static network so ethers does not spam eth_chainId. */
const NETWORK = new ethers.Network(
  "BOT Chain Testnet",
  CHAIN_CONFIG.chainId
);

let _provider: ethers.JsonRpcProvider | null = null;

/**
 * Shared public RPC for contract reads.
 * Public BOT endpoints rate-limit hard; keep one client and batch where possible.
 */
export function getReadProvider(): ethers.JsonRpcProvider {
  if (!_provider) {
    _provider = new ethers.JsonRpcProvider(CHAIN_CONFIG.rpcUrl, NETWORK, {
      staticNetwork: NETWORK,
      batchMaxCount: 6,
      batchStallTime: 50,
    });
  }
  return _provider;
}

export function isRpcThrottleError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("-32002") ||
    msg.includes("too many errors") ||
    msg.includes("rate limit") ||
    msg.includes("429") ||
    msg.includes("coalesce")
  );
}
