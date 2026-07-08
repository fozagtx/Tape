"use client";

import React from "react";
import { useWallet } from "./WalletProvider";
import { CHAIN_CONFIG } from "@/lib/config";

export default function Header() {
  const { address, balance, chainId, isConnected, isConnecting, connect, disconnect, switchChain } = useWallet();
  const isCorrectChain = chainId === CHAIN_CONFIG.chainId;

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1920px] items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-green)]/20 to-[var(--color-accent)]/20">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-green)]"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
            </div>
            <div><h1 className="text-sm font-bold tracking-wider text-white">TAPE</h1><p className="text-[10px] tracking-widest text-[var(--color-dim)]">ORDER BOOK</p></div>
          </div>
          <div className="hidden items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-2.5 py-1 sm:flex">
            <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-green)] animate-pulse" />
            <span className="text-[10px] font-medium text-[var(--color-dim)]">BOT Chain</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isConnected ? (
            <button onClick={connect} disabled={isConnecting} className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-green)]/80 px-4 py-2 text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50">
              {isConnecting ? <><span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />Connecting</> : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 10H2" /><circle cx="18" cy="15" r="1.5" /></svg>Connect Wallet</>}
            </button>
          ) : (
            <>
              {!isCorrectChain && <button onClick={switchChain} className="rounded-lg border border-[var(--color-red)]/30 bg-[var(--color-red)]/10 px-3 py-1.5 text-[10px] font-semibold text-[var(--color-red)] transition-colors hover:bg-[var(--color-red)]/20">Wrong Network</button>}
              <div className="hidden items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-1.5 sm:flex">
                <span className="text-[10px] text-[var(--color-dim)]">{Number(balance).toFixed(3)} BOT</span>
              </div>
              <button onClick={disconnect} className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-1.5 text-xs font-medium text-[var(--color-txt)] transition-colors hover:border-[var(--color-green)]/30 hover:bg-[var(--color-green)]/5">
                <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-green)]" />
                <span className="hidden sm:inline">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                <span className="sm:hidden">{address?.slice(0, 6)}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
