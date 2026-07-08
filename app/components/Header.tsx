"use client";

import React, { useState, useRef, useEffect } from "react";
import { useWallet } from "./WalletProvider";
import { CHAIN_CONFIG } from "@/lib/config";

function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export default function Header() {
  const {
    address,
    balance,
    chainId,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    switchChain,
    contractAddress,
    clearContract,
    error,
    clearError,
    hasWallet,
  } = useWallet();
  const isCorrectChain = chainId === CHAIN_CONFIG.chainId;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-3 px-3 sm:px-4 lg:px-6">
        {/* Brand */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-elevated)]"
              aria-hidden
            >
              <span className="font-mono text-sm font-bold tracking-tighter text-[var(--color-accent)]">
                T
              </span>
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold tracking-wide text-[var(--color-white)]">
                Tape
              </h1>
              <p className="hidden text-[10px] text-[var(--color-dim)] sm:block">
                On-chain limit order book
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-2.5 py-1 md:flex">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isConnected && isCorrectChain
                  ? "bg-[var(--color-green)] animate-pulse-dot"
                  : "bg-[var(--color-dim)]"
              }`}
              aria-hidden
            />
            <span className="text-[10px] font-medium text-[var(--color-muted)]">
              BOT Testnet
            </span>
          </div>

          {contractAddress && (
            <a
              href={`${CHAIN_CONFIG.explorerUrl}/address/${contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden max-w-[140px] truncate rounded-md border border-[var(--color-border)] bg-[var(--color-card)] px-2 py-1 font-mono text-[10px] text-[var(--color-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-txt)] lg:inline-block"
              title={contractAddress}
            >
              {shortAddr(contractAddress)}
            </a>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!isConnected ? (
            <button
              type="button"
              onClick={connect}
              disabled={isConnecting}
              className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[var(--color-accent)] px-4 py-2 text-xs font-semibold text-[#0c0d10] transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isConnecting ? (
                <>
                  <span
                    className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#0c0d10]/30 border-t-[#0c0d10]"
                    aria-hidden
                  />
                  Connecting…
                </>
              ) : hasWallet === false ? (
                "Install a wallet"
              ) : (
                "Connect wallet"
              )}
            </button>
          ) : (
            <>
              {!isCorrectChain && (
                <button
                  type="button"
                  onClick={switchChain}
                  className="inline-flex min-h-10 items-center rounded-md border border-[var(--color-red)]/40 bg-[var(--color-red-dim)] px-3 py-2 text-xs font-semibold text-[var(--color-red)] transition-colors hover:bg-[var(--color-red)]/20"
                >
                  Switch to BOT
                </button>
              )}

              <div className="hidden items-center rounded-md border border-[var(--color-border)] bg-[var(--color-card)] px-2.5 py-1.5 sm:flex">
                <span className="font-mono text-xs tabular-nums text-[var(--color-txt)]">
                  {Number(balance).toFixed(4)}{" "}
                  <span className="text-[var(--color-dim)]">BOT</span>
                </span>
              </div>

              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-xs font-medium text-[var(--color-txt)] transition-colors hover:border-[var(--color-border-strong)]"
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isCorrectChain
                        ? "bg-[var(--color-green)]"
                        : "bg-[var(--color-red)]"
                    }`}
                    aria-hidden
                  />
                  <span className="font-mono">
                    {address ? shortAddr(address) : "—"}
                  </span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden
                    className="text-[var(--color-dim)]"
                  >
                    <path
                      d="M3 4.5L6 7.5L9 4.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-50 mt-1.5 w-52 overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-elevated)] py-1 shadow-lg shadow-black/40"
                  >
                    <div className="border-b border-[var(--color-border)] px-3 py-2">
                      <p className="text-[10px] text-[var(--color-dim)]">
                        Connected
                      </p>
                      <p className="truncate font-mono text-xs text-[var(--color-txt)]">
                        {address}
                      </p>
                    </div>
                    {contractAddress && (
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          clearContract();
                          setMenuOpen(false);
                        }}
                        className="flex w-full px-3 py-2.5 text-left text-xs text-[var(--color-muted)] transition-colors hover:bg-white/[0.04] hover:text-[var(--color-txt)]"
                      >
                        Disconnect contract
                      </button>
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        disconnect();
                        setMenuOpen(false);
                      }}
                      className="flex w-full px-3 py-2.5 text-left text-xs text-[var(--color-red)] transition-colors hover:bg-[var(--color-red-dim)]"
                    >
                      Disconnect wallet
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="border-t border-[var(--color-red)]/20 bg-[var(--color-red-dim)]">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-3 py-2 sm:px-4 lg:px-6">
            <p className="text-xs text-[var(--color-red)]">{error}</p>
            <button
              type="button"
              onClick={clearError}
              className="shrink-0 text-xs font-medium text-[var(--color-red)] underline-offset-2 hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
