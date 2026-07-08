"use client";

import React, { useState, useEffect } from "react";
import { useWallet } from "./WalletProvider";
import type { EventLog } from "ethers";

interface UserOrder { id: number; isBuy: boolean; price: number; quantity: number; }

export default function UserOrders() {
  const { contract, address, isConnected } = useWallet();
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<number | null>(null);

  const fetchOrders = async () => {
    if (!contract || !address) return;
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
            parsed.push({ id, isBuy: order.isBuy, price: Number(order.price) / 1e9, quantity: Number(order.quantity) });
          }
        } catch { /* skip */ }
      }
      setOrders(parsed.reverse());
      setLoading(false);
    } catch { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [contract, address]);

  const handleCancel = async (id: number) => {
    if (!contract) return;
    setCancelling(id);
    try {
      const tx = await contract.cancelOrder(id);
      await tx.wait();
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch { /* silent */ }
    finally { setCancelling(null); }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-8 text-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-dim)" strokeWidth="1.5" className="mb-3"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 10H2" /><circle cx="18" cy="15" r="1.5" /></svg>
        <p className="text-xs text-[var(--color-dim)]">Connect wallet to see your orders</p>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-8 text-center">
        <p className="text-xs text-[var(--color-dim)]">Connect contract to view orders</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-8">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-accent)]/30 border-t-[var(--color-accent)]" />
        <p className="mt-2 text-[10px] text-[var(--color-dim)]">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
        <h2 className="text-xs font-bold tracking-wider text-white">MY ORDERS</h2>
        <span className="text-[10px] text-[var(--color-dim)]">{orders.length} open</span>
      </div>
      {orders.length === 0 ? (
        <div className="flex items-center justify-center py-8"><p className="text-xs text-[var(--color-dim)]">No open orders</p></div>
      ) : (
        <div className="max-h-[250px] overflow-y-auto">
          <div className="grid grid-cols-[60px_1fr_1fr_1fr_80px] gap-2 px-4 py-2 text-[10px] font-medium text-[var(--color-dim)]">
            <span>SIDE</span><span>PRICE</span><span>QTY</span><span>ID</span><span className="text-right">ACTION</span>
          </div>
          {orders.map((o) => (
            <div key={o.id} className="grid grid-cols-[60px_1fr_1fr_1fr_80px] gap-2 px-4 py-[6px] text-xs hover:bg-white/[0.02]">
              <span className={`font-semibold ${o.isBuy ? "text-[var(--color-green)]" : "text-[var(--color-red)]"}`}>{o.isBuy ? "BUY" : "SELL"}</span>
              <span className="font-mono tabular-nums text-[var(--color-txt)]">{o.price.toFixed(4)}</span>
              <span className="font-mono tabular-nums text-[var(--color-txt)]">{o.quantity}</span>
              <span className="font-mono text-[var(--color-dim)]">#{o.id}</span>
              <div className="text-right">
                <button onClick={() => handleCancel(o.id)} disabled={cancelling === o.id} className="rounded border border-[var(--color-red)]/30 px-2 py-0.5 text-[10px] text-[var(--color-red)] transition-colors hover:bg-[var(--color-red)]/10 disabled:opacity-50">
                  {cancelling === o.id ? "..." : "Cancel"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
