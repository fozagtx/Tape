"use client";

import React, { useState } from "react";
import { useWallet } from "./WalletProvider";
import { ethers } from "ethers";

type Side = "buy" | "sell";

export default function TradeForm() {
  const { isConnected, contract } = useWallet();
  const [side, setSide] = useState<Side>("buy");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const total = (parseFloat(price || "0") * parseFloat(quantity || "0")).toFixed(4);
  const qAmounts = [1, 5, 10, 25, 50, 100];

  const handleSubmit = async () => {
    if (!isConnected || !contract) { setError("Connect wallet and contract first"); return; }
    if (!price || !quantity || parseFloat(price) <= 0 || parseFloat(quantity) <= 0) {
      setError("Enter valid price and quantity"); return;
    }
    setIsSubmitting(true); setError(null); setTxHash(null);
    try {
      const priceGwei = ethers.parseUnits(price, "gwei");
      const qty = BigInt(Math.floor(parseFloat(quantity)));
      const tx = await contract.placeOrder(side === "buy", priceGwei, qty);
      const r = await tx.wait();
      setTxHash(r.hash);
      setQuantity("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">
      <div className="border-b border-[var(--color-border)] px-4 py-3"><h2 className="text-xs font-bold tracking-wider text-white">PLACE ORDER</h2></div>
      <div className="grid grid-cols-2 gap-1 p-3">
        <button onClick={() => setSide("buy")} className={side === "buy" ? "rounded-lg py-2.5 text-xs font-bold tracking-wide transition-all bg-[var(--color-green)]/15 text-[var(--color-green)]" : "rounded-lg py-2.5 text-xs font-bold tracking-wide transition-all bg-[var(--color-bg)] text-[var(--color-dim)] hover:text-[var(--color-txt)]"}>BUY / LONG</button>
        <button onClick={() => setSide("sell")} className={side === "sell" ? "rounded-lg py-2.5 text-xs font-bold tracking-wide transition-all bg-[var(--color-red)]/15 text-[var(--color-red)]" : "rounded-lg py-2.5 text-xs font-bold tracking-wide transition-all bg-[var(--color-bg)] text-[var(--color-dim)] hover:text-[var(--color-txt)]"}>SELL / SHORT</button>
      </div>
      <div className="flex flex-col gap-3 px-4">
        <div><label className="mb-1 block text-[10px] font-medium text-[var(--color-dim)]">PRICE (gwei)</label>
          <div className="relative"><input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 text-sm text-white outline-none font-mono tabular-nums focus:border-[var(--color-accent)]/50" placeholder="100" step="0.01" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[var(--color-dim)]">gwei</span></div></div>
        <div><label className="mb-1 block text-[10px] font-medium text-[var(--color-dim)]">QUANTITY</label>
          <div className="relative"><input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 text-sm text-white outline-none font-mono tabular-nums focus:border-[var(--color-accent)]/50" placeholder="1" step="1" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[var(--color-dim)]">units</span></div>
          <div className="mt-2 flex flex-wrap gap-1">{qAmounts.map((a) => <button key={a} onClick={() => setQuantity(String(a))} className="flex-1 rounded border border-[var(--color-border)] bg-[var(--color-bg)] py-1 text-[10px] text-[var(--color-dim)] transition-colors hover:border-[var(--color-accent)]/30 hover:text-[var(--color-txt)]">{a}</button>)}</div></div>
      </div>
      <div className="flex flex-col gap-3 px-4 pb-4 pt-3">
        <div className="flex items-center justify-between rounded-lg bg-[var(--color-bg)] px-3 py-2"><span className="text-[10px] text-[var(--color-dim)]">TOTAL</span><span className="text-sm font-medium text-white tabular-nums">{total}</span></div>
        <div className="flex items-center justify-between text-[10px]"><span className="text-[var(--color-dim)]">Network Fee</span><span className="text-[var(--color-green)]">~0.001 BOT</span></div>
        <div className="flex items-center justify-between text-[10px]"><span className="text-[var(--color-dim)]">Block Time</span><span className="text-[var(--color-txt)]">0.75s</span></div>
        <button onClick={handleSubmit} disabled={isSubmitting || !contract} className={`mt-1 w-full rounded-lg py-3 text-xs font-bold tracking-wide transition-all active:scale-[0.98] disabled:opacity-50 ${side === "buy" ? "bg-[var(--color-green)]/15 text-[var(--color-green)] hover:bg-[var(--color-green)]/25" : "bg-[var(--color-red)]/15 text-[var(--color-red)] hover:bg-[var(--color-red)]/25"}`}>
          {isSubmitting ? <span className="flex items-center justify-center gap-2"><span className="h-3 w-3 animate-spin rounded-full border-2 border-current/30 border-t-current" />PLACING...</span> : !contract ? "CONNECT CONTRACT FIRST" : `${side === "buy" ? "BUY" : "SELL"}`}
        </button>
        {txHash && <div className="animate-fade-in rounded-lg bg-[var(--color-green)]/10 px-3 py-2 text-[10px] text-[var(--color-green)]">✓ Order placed: {txHash.slice(0, 10)}...{txHash.slice(-6)}</div>}
        {error && <div className="animate-fade-in rounded-lg bg-[var(--color-red)]/10 px-3 py-2 text-[10px] text-[var(--color-red)]">✕ {error}</div>}
      </div>
    </div>
  );
}
