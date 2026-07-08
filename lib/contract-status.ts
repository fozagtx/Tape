import { ethers } from "ethers";
import { CHAIN_CONFIG } from "./config";
import { TAPE_ABI } from "./abi";

/** Human-readable short address for UI */
export function shortContract(addr: string = CHAIN_CONFIG.contractAddress) {
  if (!addr || addr.length < 10) return addr || "—";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/**
 * Probe whether CHAIN_CONFIG.contractAddress is a live TapeOrderBook.
 * The historical 0xFFFC… address only has stub code — reads decode-fail.
 */
export async function probeTapeContract(
  provider: ethers.Provider = new ethers.JsonRpcProvider(CHAIN_CONFIG.rpcUrl),
  address: string = CHAIN_CONFIG.contractAddress
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!ethers.isAddress(address)) {
    return { ok: false, reason: "Invalid contract address in config." };
  }
  try {
    const code = await provider.getCode(address);
    if (!code || code === "0x") {
      return {
        ok: false,
        reason: `No contract code at ${shortContract(address)}. Deploy TapeOrderBook and set the address in lib/config.ts.`,
      };
    }
    const c = new ethers.Contract(address, TAPE_ABI, provider);
    await c.nextOrderId();
    return { ok: true };
  } catch {
    return {
      ok: false,
      reason: `Address ${shortContract(address)} has code, but it is not a working TapeOrderBook (calls like stats() fail). Redeploy with Hardhat and update lib/config.ts.`,
    };
  }
}

export const CONTRACT_READ_HELP =
  "Reads use the public RPC and the address in lib/config.ts — you do not need to connect a wallet to load the book.";
