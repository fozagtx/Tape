"use client";

import React, { useState } from "react";
import { useWallet } from "./WalletProvider";
import { ethers } from "ethers";
import { TAPE_ABI } from "@/lib/abi";
import { CHAIN_CONFIG } from "@/lib/config";
import { TAPE_BYTECODE } from "@/lib/bytecode";

export default function DeployContract() {
  const {
    isConnected,
    signer,
    setContract,
    chainId,
    connect,
    switchChain,
    isConnecting,
    provider,
    hasWallet,
  } = useWallet();
  const [isDeploying, setIsDeploying] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contractInput, setContractInput] = useState("");

  const isCorrectChain = chainId === CHAIN_CONFIG.chainId;

  const handleDeploy = async () => {
    if (!signer) {
      setError("Connect your wallet first.");
      return;
    }
    if (!isCorrectChain) {
      setError("Switch to BOT Chain Testnet first.");
      return;
    }
    setIsDeploying(true);
    setError(null);
    try {
      const factory = new ethers.ContractFactory(
        TAPE_ABI,
        TAPE_BYTECODE,
        signer
      );
      const contract = await factory.deploy();
      await contract.waitForDeployment();
      setContract(await contract.getAddress());
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Deployment failed";
      setError(
        msg.includes("user rejected")
          ? "You rejected the deployment in your wallet."
          : msg.length > 160
            ? msg.slice(0, 160) + "…"
            : msg
      );
    } finally {
      setIsDeploying(false);
    }
  };

  const handleLoad = async () => {
    const addr = contractInput.trim();
    if (!ethers.isAddress(addr)) {
      setError("Enter a valid contract address (0x…).");
      return;
    }
    if (!provider) {
      setError("Connect your wallet first.");
      return;
    }
    setIsValidating(true);
    setError(null);
    try {
      const code = await provider.getCode(addr);
      if (code === "0x") {
        setError("No contract found at that address on this network.");
        return;
      }
      const probe = new ethers.Contract(addr, TAPE_ABI, provider);
      await probe.nextOrderId();
      setContract(addr);
    } catch {
      setError(
        "That address is not a TapeOrderBook contract on BOT Chain Testnet."
      );
    } finally {
      setIsValidating(false);
    }
  };

  // ── Not connected ──────────────────────────────────────
  if (!isConnected) {
    return (
      <div className="panel animate-fade-in p-6 sm:p-8">
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-elevated)]">
          <span className="font-mono text-lg font-bold text-[var(--color-accent)]">
            T
          </span>
        </div>
        <h2 className="mb-1.5 text-lg font-semibold text-[var(--color-white)]">
          Get started with Tape
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-[var(--color-muted)]">
          Tape is a fully on-chain limit order book on BOT Chain. Connect a
          wallet to deploy or load the order book and start trading.
        </p>
        <ul className="mb-6 space-y-2 text-xs text-[var(--color-muted)]">
          <li className="flex gap-2">
            <span className="text-[var(--color-accent)]">1.</span>
            Connect MetaMask (or any EVM wallet)
          </li>
          <li className="flex gap-2">
            <span className="text-[var(--color-accent)]">2.</span>
            Switch to BOT Chain Testnet
          </li>
          <li className="flex gap-2">
            <span className="text-[var(--color-accent)]">3.</span>
            Deploy a new book or paste an existing address
          </li>
        </ul>
        <button
          type="button"
          onClick={connect}
          disabled={isConnecting}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-[#0c0d10] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isConnecting
            ? "Connecting…"
            : hasWallet === false
              ? "Install MetaMask"
              : "Connect wallet"}
        </button>
        {hasWallet === false && (
          <p className="mt-3 text-center text-xs text-[var(--color-dim)]">
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent)] underline-offset-2 hover:underline"
            >
              Download MetaMask
            </a>{" "}
            then refresh this page.
          </p>
        )}
      </div>
    );
  }

  // ── Wrong network ──────────────────────────────────────
  if (!isCorrectChain) {
    return (
      <div className="panel animate-fade-in p-6 sm:p-8">
        <div className="mb-4 inline-flex rounded-md border border-[var(--color-red)]/30 bg-[var(--color-red-dim)] px-2.5 py-1 text-xs font-medium text-[var(--color-red)]">
          Wrong network
        </div>
        <h2 className="mb-1.5 text-lg font-semibold text-[var(--color-white)]">
          Switch to BOT Chain Testnet
        </h2>
        <p className="mb-2 text-sm leading-relaxed text-[var(--color-muted)]">
          Tape runs on BOT Chain Testnet (chain ID{" "}
          <span className="font-mono text-[var(--color-txt)]">
            {CHAIN_CONFIG.chainId}
          </span>
          ). Your wallet is on a different network.
        </p>
        <p className="mb-6 text-xs text-[var(--color-dim)]">
          RPC: {CHAIN_CONFIG.rpcUrl}
        </p>
        <button
          type="button"
          onClick={switchChain}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-[#0c0d10] transition-opacity hover:opacity-90"
        >
          Switch to BOT Chain Testnet
        </button>
      </div>
    );
  }

  // ── Setup ──────────────────────────────────────────────
  return (
    <div className="panel animate-fade-in p-6 sm:p-8">
      <h2 className="mb-1 text-lg font-semibold text-[var(--color-white)]">
        Set up order book
      </h2>
      <p className="mb-6 text-sm leading-relaxed text-[var(--color-muted)]">
        Deploy a fresh TapeOrderBook, or load one you already deployed on BOT
        Chain Testnet.
      </p>

      <button
        type="button"
        onClick={handleDeploy}
        disabled={isDeploying}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-[#0c0d10] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isDeploying ? (
          <>
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-[#0c0d10]/30 border-t-[#0c0d10]"
              aria-hidden
            />
            Confirm in wallet…
          </>
        ) : (
          "Deploy new order book"
        )}
      </button>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <div className="w-full border-t border-[var(--color-border)]" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[var(--color-card)] px-3 text-[10px] font-medium uppercase tracking-wider text-[var(--color-dim)]">
            or load existing
          </span>
        </div>
      </div>

      <div>
        <label
          htmlFor="contract-address"
          className="mb-1.5 block text-xs font-medium text-[var(--color-muted)]"
        >
          Contract address
        </label>
        <div className="flex gap-2">
          <input
            id="contract-address"
            type="text"
            value={contractInput}
            onChange={(e) => setContractInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleLoad();
            }}
            placeholder="0x…"
            spellCheck={false}
            autoComplete="off"
            className="min-h-11 flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 font-mono text-sm text-[var(--color-white)] outline-none transition-colors placeholder:text-[var(--color-dim)] focus:border-[var(--color-accent)]/60"
          />
          <button
            type="button"
            onClick={handleLoad}
            disabled={isValidating || !contractInput.trim()}
            className="inline-flex min-h-11 min-w-[5.5rem] items-center justify-center rounded-md border border-[var(--color-border-strong)] bg-[var(--color-elevated)] px-4 text-sm font-semibold text-[var(--color-white)] transition-colors hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-accent-dim)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isValidating ? "Checking…" : "Load"}
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-md border border-[var(--color-red)]/25 bg-[var(--color-red-dim)] px-3 py-2.5 text-xs leading-relaxed text-[var(--color-red)]"
        >
          {error}
        </div>
      )}

      <p className="mt-5 text-[11px] leading-relaxed text-[var(--color-dim)]">
        Need testnet BOT? Use the faucet linked from{" "}
        <a
          href="https://botchain.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-accent)] underline-offset-2 hover:underline"
        >
          botchain.ai
        </a>
        . Explorer:{" "}
        <a
          href={CHAIN_CONFIG.explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-accent)] underline-offset-2 hover:underline"
        >
          {new URL(CHAIN_CONFIG.explorerUrl).hostname}
        </a>
      </p>
    </div>
  );
}
