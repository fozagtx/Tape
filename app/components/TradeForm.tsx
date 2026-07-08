"use client";

import React, { useState } from "react";
import { useWallet } from "./WalletProvider";
import { ethers } from "ethers";
import { CHAIN_CONFIG } from "@/lib/config";

type Side = "buy" | "sell";

const QTY_PRESETS = [1, 5, 10, 25, 50, 100];

export default function TradeForm() {
  const { isConnected, contract, chainId } = useWallet();
  const [side, setSide] = useState<Side>("buy");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const priceNum = parseFloat(price);
  const qtyNum = parseFloat(quantity);
  const valid =
    Number.isFinite(priceNum) &&
    priceNum > 0 &&
    Number.isFinite(qtyNum) &&
    qtyNum > 0 &&
    Number.isInteger(qtyNum);
  const total =
    valid ? (priceNum * qtyNum).toFixed(4) : "—";

  const onCorrectChain = chainId === CHAIN_CONFIG.chainId;
  const canSubmit =
    isConnected && contract && onCorrectChain && valid && !isSubmitting;

  const handleSubmit = async () => {
    if (!isConnected || !contract) {
      setError("Connect wallet and load an order book first.");
      return;
    }
    if (!onCorrectChain) {
      setError("Switch to BOT Chain Testnet first.");
      return;
    }
    if (!valid) {
      setError(
        Number.isFinite(qtyNum) && !Number.isInteger(qtyNum)
          ? "Quantity must be a whole number."
          : "Enter a price above 0 and a whole-number quantity."
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setTxHash(null);

    try {
      const priceGwei = ethers.parseUnits(price, "gwei");
      const qty = BigInt(Math.floor(qtyNum));
      const tx = await contract.placeOrder(side === "buy", priceGwei, qty);
      const receipt = await tx.wait();
      setTxHash(receipt.hash);
      setQuantity("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Transaction failed";
      if (msg.includes("user rejected") || msg.includes("ACTION_REJECTED")) {
        setError("You rejected the transaction.");
      } else {
        setError(msg.length > 180 ? msg.slice(0, 180) + "…" : msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="panel flex flex-col">
      <div className="panel-header">
        <h2 className="panel-title">Place order</h2>
        <span className="text-[10px] text-[var(--color-dim)]">Limit</span>
      </div>

      <div className="grid grid-cols-2 gap-1 p-3">
        <button
          type="button"
          onClick={() => setSide("buy")}
          aria-pressed={side === "buy"}
          className={`min-h-10 rounded-md text-xs font-semibold tracking-wide transition-colors ${
            side === "buy"
              ? "bg-[var(--color-green-dim)] text-[var(--color-green)] ring-1 ring-[var(--color-green)]/30"
              : "bg-[var(--color-bg)] text-[var(--color-dim)] hover:text-[var(--color-txt)]"
          }`}
        >
          Buy
        </button>
        <button
          type="button"
          onClick={() => setSide("sell")}
          aria-pressed={side === "sell"}
          className={`min-h-10 rounded-md text-xs font-semibold tracking-wide transition-colors ${
            side === "sell"
              ? "bg-[var(--color-red-dim)] text-[var(--color-red)] ring-1 ring-[var(--color-red)]/30"
              : "bg-[var(--color-bg)] text-[var(--color-dim)] hover:text-[var(--color-txt)]"
          }`}
        >
          Sell
        </button>
      </div>

      <div className="flex flex-col gap-3 px-3">
        <div>
          <label
            htmlFor="order-price"
            className="mb-1.5 block text-[10px] font-medium uppercase tracking-wide text-[var(--color-dim)]"
          >
            Price (gwei)
          </label>
          <div className="relative">
            <input
              id="order-price"
              type="number"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="min-h-11 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 font-mono text-sm tabular-nums text-[var(--color-white)] outline-none transition-colors placeholder:text-[var(--color-dim)] focus:border-[var(--color-accent)]/50"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[var(--color-dim)]">
              gwei
            </span>
          </div>
        </div>

        <div>
          <label
            htmlFor="order-qty"
            className="mb-1.5 block text-[10px] font-medium uppercase tracking-wide text-[var(--color-dim)]"
          >
            Quantity
          </label>
          <div className="relative">
            <input
              id="order-qty"
              type="number"
              inputMode="numeric"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="min-h-11 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 font-mono text-sm tabular-nums text-[var(--color-white)] outline-none transition-colors placeholder:text-[var(--color-dim)] focus:border-[var(--color-accent)]/50"
              placeholder="0"
              step="1"
              min="1"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[var(--color-dim)]">
              units
            </span>
          </div>
          <div className="mt-2 grid grid-cols-6 gap-1">
            {QTY_PRESETS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setQuantity(String(a))}
                className="min-h-8 rounded border border-[var(--color-border)] bg-[var(--color-bg)] text-[10px] text-[var(--color-dim)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-txt)]"
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-3 border-t border-[var(--color-border)] px-3 pb-3 pt-3">
        <div className="flex items-center justify-between rounded-md bg-[var(--color-bg)] px-3 py-2.5">
          <span className="text-[10px] uppercase tracking-wide text-[var(--color-dim)]">
            Notional
          </span>
          <span className="font-mono text-sm font-medium tabular-nums text-[var(--color-white)]">
            {total}{" "}
            <span className="text-[10px] font-normal text-[var(--color-dim)]">
              gwei·units
            </span>
          </span>
        </div>

        <p className="text-[10px] leading-relaxed text-[var(--color-dim)]">
          Orders settle on-chain (~0.75s blocks). Gas is paid in BOT — check your
          wallet for the exact fee before confirming.
        </p>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md text-xs font-bold tracking-wide transition-opacity disabled:cursor-not-allowed disabled:opacity-40 ${
            side === "buy"
              ? "bg-[var(--color-green)] text-[#0c0d10] hover:opacity-90"
              : "bg-[var(--color-red)] text-white hover:opacity-90"
          }`}
        >
          {isSubmitting ? (
            <>
              <span
                className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current/30 border-t-current"
                aria-hidden
              />
              Confirm in wallet…
            </>
          ) : !isConnected ? (
            "Connect wallet to trade"
          ) : !contract ? (
            "Load order book first"
          ) : !onCorrectChain ? (
            "Wrong network"
          ) : (
            `${side === "buy" ? "Buy" : "Sell"} limit`
          )}
        </button>

        {txHash && (
          <div
            role="status"
            className="animate-fade-in rounded-md border border-[var(--color-green)]/25 bg-[var(--color-green-dim)] px-3 py-2 text-xs text-[var(--color-green)]"
          >
            Order submitted.{" "}
            <a
              href={`${CHAIN_CONFIG.explorerUrl}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline-offset-2 hover:underline"
            >
              View on explorer
            </a>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="animate-fade-in rounded-md border border-[var(--color-red)]/25 bg-[var(--color-red-dim)] px-3 py-2 text-xs leading-relaxed text-[var(--color-red)]"
          >
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
