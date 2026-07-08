"use client";

import React from "react";
import { CHAIN_CONFIG } from "@/lib/config";

export default function ChainInfo() {
  const { chainId, rpcUrl, blockTime } = CHAIN_CONFIG;
  const rpcHost = new URL(rpcUrl).hostname;
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <h3 className="mb-3 text-xs font-bold tracking-wider text-white">BOT CHAIN INFO</h3>
      <div className="flex flex-col gap-2 text-xs">
        <div className="flex justify-between"><span className="text-[var(--color-dim)]">Network</span><span className="text-[var(--color-txt)]">BOT Chain L1</span></div>
        <div className="flex justify-between"><span className="text-[var(--color-dim)]">Chain ID</span><span className="text-[var(--color-txt)] font-mono">{chainId}</span></div>
        <div className="flex justify-between"><span className="text-[var(--color-dim)]">RPC</span><span className="text-[var(--color-txt)] font-mono text-[10px]">{rpcHost}</span></div>
        <div className="flex justify-between"><span className="text-[var(--color-dim)]">Block Time</span><span className="text-[var(--color-green)]">{(blockTime / 1000).toFixed(2)}s</span></div>
        <div className="flex justify-between"><span className="text-[var(--color-dim)]">Finality</span><span className="text-[var(--color-green)]">~0.9s</span></div>
        <div className="flex justify-between"><span className="text-[var(--color-dim)]">Consensus</span><span className="text-[var(--color-txt)]">SPoA</span></div>
        <div className="flex justify-between"><span className="text-[var(--color-dim)]">Gas</span><span className="text-[var(--color-green)]">~0.001 BOT</span></div>
      </div>
    </div>
  );
}
