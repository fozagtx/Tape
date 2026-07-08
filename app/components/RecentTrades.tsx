"use client";

import React, { useState, useEffect } from "react";
import { useWallet } from "./WalletProvider";

interface TradeEvent { price: number; quantity: number; buyId: bigint; sellId: bigint; timestamp: number; }

export default function RecentTrades() {
  const { contract } = useWallet();
  const [trades, setTrades] = useState<TradeEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!contract) return;
    const filter = contract.filters.OrderMatched();
    contract.queryFilter(filter, -1000).then((events) => {
      const parsed = events.map((ev) => ({
        price: Number(ev.args?.price || 0) / 1e9,
        quantity: Number(ev.args?.quantity || 0),
        buyId: ev.args?.buyId || 0n,
        sellId: ev.args?.sellId || 0n,
        timestamp: Date.now(),
      }));
      setTrades(parsed.reverse().slice(0, 20));
      setLoading(false);
    }).catch(() => setLoading(false));

    const onMatch = (buyId: bigint, sellId: bigint, _buyer: string, _seller: string, price: bigint, qty: bigint) => {
      setTrades((prev) => [{
        price: Number(price) / 1e9,
        quantity: Number(qty),
        buyId, sellId,
        timestamp: Date.now(),
      }, ...prev.slice(0, 19)]);
    };
    contract.on("OrderMatched", onMatch);
    return () => { contract.off("OrderMatched", onMatch); };
  }, [contract]);

  if (!contract) {
    return (
      <div className="flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 text-center">
        <h2 className="mb-2 text-xs font-bold tracking-wider text-white">RECENT TRADES</h2>
        <p className="text-xs text-[var(--color-dim)]">Connect contract to view trades</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-8">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-accent)]/30 border-t-[var(--color-accent)]" />
        <p className="mt-2 text-[10px] text-[var(--color-dim)]">Loading trades...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
        <h2 className="text-xs font-bold tracking-wider text-white">RECENT TRADES</h2>
        <span className="text-[10px] text-[var(--color-dim)]">{trades.length} trades</span>
      </div>
      <div className="grid grid-cols-3 px-4 py-2 text-[10px] font-medium text-[var(--color-dim)]">
        <span>PRICE</span><span className="text-right">QTY</span><span className="text-right">MATCH</span>
      </div>
      <div className="max-h-[300px] overflow-y-auto">
        {trades.length === 0 ? (
          <div className="flex items-center justify-center py-8"><p className="text-xs text-[var(--color-dim)]">No trades yet</p></div>
        ) : (
          trades.slice(0, 15).map((t, i) => (
            <div key={i} className="grid grid-cols-3 px-4 py-[5px] text-xs transition-colors hover:bg-white/[0.02]">
              <span className="font-mono tabular-nums text-[var(--color-txt)]">{t.price.toFixed(4)}</span>
              <span className="text-right font-mono tabular-nums text-[var(--color-txt)]">{t.quantity}</span>
              <span className="text-right text-[var(--color-dim)]">#{t.buyId}×#{t.sellId}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
