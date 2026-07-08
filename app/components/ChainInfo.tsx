"use client";

import React from "react";
import { CHAIN_CONFIG } from "@/lib/config";

export default function ChainInfo() {
  const { chainId, rpcUrl, blockTime } = CHAIN_CONFIG;
  const rpcHost = new URL(rpcUrl).hostname;
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-2.5">
      <div className="flex items-center gap-2 text-[11px] leading-none">
        <span className="font-medium text-[var(--color-dim)] tracking-wider">BOT</span>
        <span className="h-3 w-px bg-[var(--color-border)]" />
        <span className="font-mono tabular-nums text-[var(--color-txt)]">{chainId}</span>
        <span className="h-3 w-px bg-[var(--color-border)]" />
        <span className="text-[var(--color-green)]">{(blockTime / 1000).toFixed(2)}s</span>
        <span className="h-3 w-px bg-[var(--color-border)]" />
        <span className="text-[var(--color-dim)] truncate max-w-[120px]">{rpcHost}</span>
      </div>
    </div>
  );
}
