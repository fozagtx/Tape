"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useWallet } from "./WalletProvider";
import type { EventLog } from "ethers";

interface UserOrder {
  id: number;
  isBuy: boolean;
  price: number;
  quantity: number;
}

export default function UserOrders() {
  const { contract, address, isConnected } = useWallet();
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (opts?: { silent?: boolean }) => {
    if (!contract || !address) return;
    if (!opts?.silent) setLoading(true);
    try {
      const filter = contract.filters.OrderPlaced(null, address);
      const events = await contract.queryFilter(filter, -5000);
      const parsed: UserOrder[] = [];
      for (const ev of events) {
        const e = ev as EventLog;
        const id = Number(e.args?.id || 0);
        try {
          const order = await contract.getOrder(id);
          if (Number(order.quantity) > 0) {
            parsed.push({
              id,
              isBuy: order.isBuy,
              price: Number(order.price) / 1e9,
              quantity: Number(order.quantity),
            });
          }
        } catch {
          /* skip missing */
        }
      }
      setOrders(parsed.reverse());
      setError(null);
    } catch {
      setError("Could not load your open orders.");
    } finally {
      setLoading(false);
    }
  }, [contract, address]);

  useEffect(() => {
    if (!contract || !address) return;
    let cancelled = false;
    void (async () => {
      await fetchOrders();
      if (cancelled) return;
    })();
    const iv = setInterval(() => {
      void fetchOrders({ silent: true });
    }, 5000);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, [fetchOrders, contract, address]);

  const handleCancel = async (id: number) => {
    if (!contract) return;
    setCancelling(id);
    setCancelError(null);
    try {
      const tx = await contract.cancelOrder(id);
      await tx.wait();
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Cancel failed";
      setCancelError(
        msg.includes("user rejected")
          ? "Cancel rejected in wallet."
          : "Could not cancel order. Try again."
      );
    } finally {
      setCancelling(null);
    }
  };

  if (!isConnected) {
    return (
      <div className="panel px-4 py-8 text-center">
        <p className="text-sm font-medium text-[var(--color-muted)]">
          Your orders
        </p>
        <p className="mt-1 text-xs text-[var(--color-dim)]">
          Connect a wallet to see and cancel open orders.
        </p>
      </div>
    );
  }

  return (
    <div className="panel flex flex-col">
      <div className="panel-header">
        <h2 className="panel-title">My orders</h2>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[var(--color-dim)]">
            {loading && orders.length === 0
              ? "Loading…"
              : `${orders.length} open`}
          </span>
          <button
            type="button"
            onClick={() => void fetchOrders()}
            disabled={loading}
            className="rounded px-1.5 py-0.5 text-[10px] text-[var(--color-muted)] transition-colors hover:bg-white/[0.04] hover:text-[var(--color-txt)] disabled:opacity-40"
          >
            Refresh
          </button>
        </div>
      </div>

      {cancelError && (
        <div
          role="alert"
          className="mx-3 mt-2 rounded-md border border-[var(--color-red)]/25 bg-[var(--color-red-dim)] px-2.5 py-2 text-[11px] text-[var(--color-red)]"
        >
          {cancelError}
        </div>
      )}

      {loading && orders.length === 0 && (
        <div className="space-y-1.5 px-3 py-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-8 w-full" />
          ))}
        </div>
      )}

      {error && (
        <div className="px-4 py-6 text-center">
          <p className="text-xs text-[var(--color-red)]">{error}</p>
          <button
            type="button"
            onClick={() => void fetchOrders()}
            className="mt-2 text-xs font-medium text-[var(--color-accent)] underline-offset-2 hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {!error && !loading && orders.length === 0 && (
        <div className="px-4 py-8 text-center">
          <p className="text-sm font-medium text-[var(--color-muted)]">
            No open orders
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[var(--color-dim)]">
            Resting limit orders you place show up here until they fill or you
            cancel them.
          </p>
        </div>
      )}

      {!error && orders.length > 0 && (
        <div className="max-h-[250px] overflow-y-auto">
          <div className="grid grid-cols-[52px_1fr_1fr_48px_72px] gap-1 px-3 py-2 text-[10px] font-medium uppercase tracking-wide text-[var(--color-dim)]">
            <span>Side</span>
            <span>Price</span>
            <span>Qty</span>
            <span>ID</span>
            <span className="text-right"> </span>
          </div>
          {orders.map((o) => (
            <div
              key={o.id}
              className="grid grid-cols-[52px_1fr_1fr_48px_72px] items-center gap-1 px-3 py-1.5 text-xs hover:bg-white/[0.03]"
            >
              <span
                className={`font-semibold ${
                  o.isBuy
                    ? "text-[var(--color-green)]"
                    : "text-[var(--color-red)]"
                }`}
              >
                {o.isBuy ? "Buy" : "Sell"}
              </span>
              <span className="font-mono tabular-nums text-[var(--color-txt)]">
                {o.price.toFixed(4)}
              </span>
              <span className="font-mono tabular-nums text-[var(--color-txt)]">
                {o.quantity}
              </span>
              <span className="font-mono text-[var(--color-dim)]">#{o.id}</span>
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => handleCancel(o.id)}
                  disabled={cancelling === o.id}
                  className="min-h-8 min-w-[4rem] rounded border border-[var(--color-red)]/30 px-2 py-1 text-[10px] font-medium text-[var(--color-red)] transition-colors hover:bg-[var(--color-red-dim)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {cancelling === o.id ? "…" : "Cancel"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
