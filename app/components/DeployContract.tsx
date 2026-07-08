"use client";

import React, { useState } from "react";
import { useWallet } from "./WalletProvider";
import { ethers } from "ethers";
import { TAPE_ABI } from "@/lib/abi";

const BYTECODE = "0x608060405234801561001057600080fd5b5060016001600281919091556000600355600060045560006005556000600655610b7e8061003c6000396000f3fe";

export default function DeployContract() {
  const { isConnected, signer, setContract, chainId, contractAddress } = useWallet();
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contractInput, setContractInput] = useState("");

  const isCorrectChain = chainId === 1031;

  const handleDeploy = async () => {
    if (!signer) { setError("Connect wallet first"); return; }
    if (!isCorrectChain) { setError("Switch to BOT Chain first"); return; }
    setIsDeploying(true);
    setError(null);
    try {
      const factory = new ethers.ContractFactory(TAPE_ABI, BYTECODE, signer);
      const contract = await factory.deploy();
      await contract.waitForDeployment();
      const address = await contract.getAddress();
      setContract(address);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deployment failed");
    } finally {
      setIsDeploying(false);
    }
  };

  const handleLoadExisting = () => {
    if (!contractInput || !ethers.isAddress(contractInput)) {
      setError("Enter a valid contract address");
      return;
    }
    setContract(contractInput);
    setError(null);
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-8 text-center">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-dim)" strokeWidth="1.5" className="mb-4">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M22 10H2" />
          <circle cx="18" cy="15" r="1.5" />
        </svg>
        <h3 className="mb-2 text-lg font-bold text-white">Connect Wallet</h3>
        <p className="text-sm text-[var(--color-dim)]">Connect your wallet to interact with BOT Chain</p>
      </div>
    );
  }

  if (!isCorrectChain) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--color-red)]/30 bg-[var(--color-card)] p-8 text-center">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-red)" strokeWidth="1.5" className="mb-4">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
        <h3 className="mb-2 text-lg font-bold text-[var(--color-red)]">Wrong Network</h3>
        <p className="mb-4 text-sm text-[var(--color-dim)]">Switch to BOT Chain to continue</p>
      </div>
    );
  }

  if (contractAddress) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--color-green)]/30 bg-[var(--color-card)] p-8 text-center">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="1.5" className="mb-4">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <path d="M22 4L12 14.01l-3-3" />
        </svg>
        <h3 className="mb-2 text-lg font-bold text-[var(--color-green)]">Contract Connected</h3>
        <p className="font-mono text-xs text-[var(--color-txt)]">{contractAddress}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
      <h3 className="text-lg font-bold text-white">Setup TapeOrderBook</h3>
      <button onClick={handleDeploy} disabled={isDeploying} className="w-full rounded-lg bg-[var(--color-accent)] py-3 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50">
        {isDeploying ? <span className="flex items-center justify-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Deploying...</span> : "Deploy New Contract"}
      </button>
      <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--color-border)]" /></div><div className="relative flex justify-center"><span className="bg-[var(--color-card)] px-2 text-xs text-[var(--color-dim)]">OR</span></div></div>
      <div>
        <label className="mb-1 block text-xs font-medium text-[var(--color-dim)]">Existing contract Address</label>
        <div className="flex gap-2">
          <input type="text" value={contractInput} onChange={(e) => setContractInput(e.target.value)} placeholder="0x..." className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-white outline-none font-mono focus:border-[var(--color-accent)]/50" />
          <button onClick={handleLoadExisting} className="rounded-lg border border-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)]/10">Load</button>
        </div>
      </div>
      {error && <div className="rounded-lg bg-[var(--color-red)]/10 px-3 py-2 text-xs text-[var(--color-red)]">✕ {error}</div>}
    </div>
  );
}
