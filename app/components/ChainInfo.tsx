"use client";

import React from "react";
import { CHAIN_CONFIG } from "@/lib/config";
import { useWallet } from "./WalletProvider";

export default function ChainInfo() {
  const { chainId, contractAddress } = useWallet();
  const onChain = chainId === CHAIN_CONFIG.chainId;
  const rpcHost = (() => {
    try {
      return new URL(CHAIN_CONFIG.rpcUrl).hostname;
    } catch {
      return CHAIN_CONFIG.rpcUrl;
    }
  })();

  return (
    <div className="panel px-3 py-2.5">
      <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-[var(--color-dim)]">
        Network
      </p>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        <div>
          <dt className="text-[10px] text-[var(--color-dim)]">Chain</dt>
          <dd className="font-medium text-[var(--color-txt)]">
            BOT Testnet
          </dd>
        </div>
        <div>
          <dt className="text-[10px] text-[var(--color-dim)]">Chain ID</dt>
          <dd className="font-mono tabular-nums text-[var(--color-txt)]">
            {CHAIN_CONFIG.chainId}
            {chainId != null && !onChain && (
              <span className="ml-1 text-[10px] text-[var(--color-red)]">
                (wallet: {chainId})
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] text-[var(--color-dim)]">Block time</dt>
          <dd className="font-mono tabular-nums text-[var(--color-txt)]">
            {(CHAIN_CONFIG.blockTime / 1000).toFixed(2)}s
          </dd>
        </div>
        <div>
          <dt className="text-[10px] text-[var(--color-dim)]">RPC</dt>
          <dd className="truncate text-[var(--color-muted)]" title={rpcHost}>
            {rpcHost}
          </dd>
        </div>
      </dl>
      {contractAddress && (
        <a
          href={`${CHAIN_CONFIG.explorerUrl}/address/${contractAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2.5 block truncate border-t border-[var(--color-border)] pt-2 font-mono text-[10px] text-[var(--color-accent)] hover:underline"
        >
          {contractAddress}
        </a>
      )}
    </div>
  );
}
