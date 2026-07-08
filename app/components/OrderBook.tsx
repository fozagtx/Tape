"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useWallet } from "./WalletProvider";

interface BookEntry { price: number; quantity: number; total: number; }

function OrderRow({ entry, maxTotal, isBuy }: { entry: BookEntry; maxTotal: number; isBuy: boolean }) {
  const depthPct = (entry.total / maxTotal) * 100;
  return (
    <div className="group relative grid grid-cols-3 px-4 py-[3px] text-xs transition-colors hover:bg-white/[0.02]">
      <div className="absolute inset-y-0 transition-all" style={{ [isBuy ? "left" : "right"]: 0, width: `${depthPct}%`, background: isBuy ? "rgba(0, 255, 136, 0.06)" : "rgba(255, 51, 85, 0.06)" }} />
      <span className={`relative font-mono tabular-nums ${isBuy ? "text-[var(--color-green)]" : "text-[var(--color-red)]"}`}>{entry.price.toFixed(4)}</span>
      <span className="relative text-right font-mono tabular-nums text-[var(--color-txt)]">{entry.quantity.toFixed(2)}</span>
      <span className="relative text-right font-mono tabular-nums text-[var(--color-dim)]">{entry.total.toFixed(0)}</span>
    </div>
  );
}

export default function OrderBook() {
  const { contract } = useWallet();
  const [bids, setBids] = useState<BookEntry[]>([]);
  const [asks, setAsks] = useState<BookEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBook = async () => {
    if (!contract) return;
    try {
      const [bidData, askData] = await Promise.all([
        contract.getBookSide(true, 15),
        contract.getBookSide(false, 15),
      ]);
      const formatSide = (prices: bigint[], qtys: bigint[], isBuy: boolean) => {
        let running = 0;
        return prices.map((p, i) => {
          const price = Number(p) / 1e9;
          const qty = Number(qtys[i]);
          running += price * qty;
          return { price, quantity: qty, total: running };
        });
      };
      setBids(formatSide(bidData[0], bidData[1], true));
      setAsks(formatSide(askData[0], askData[1], false));
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBook(); }, [contract]);
  useEffect(() => {
    const iv = setInterval(fetchBook, 2000);
    return () => clearInterval(iv);
  }, [contract]);

  const maxTotal = useMemo(() => {
    const mb = bids[bids.length - 1]?.total || 0;
    const ma = asks[asks.length - 1]?.total || 0;
    return Math.max(mb, ma, 1);
  }, [bids, asks]);

  const spread = useMemo(() => {
    if (!asks.length || !bids.length) return { value: 0, pct: 0 };
    const v = Number((asks[0].price - bids[0].price).toFixed(4));
    return { value: v, pct: Number(((v / asks[0].price) * 100).toFixed(3)) };
  }, [asks, bids]);

  if (!contract) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-12 text-center">
        <h2 className="mb-2 text-xs font-bold tracking-wider text-white">ORDER BOOK</h2>
        <p className="text-xs text-[var(--color-dim)]">Connect contract to view live order book</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-12 text-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-accent)]/30 border-t-[var(--color-accent)]" />
        <p className="mt-3 text-xs text-[var(--color-dim)]">Loading order book...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
        <h2 className="text-xs font-bold tracking-wider text-white">ORDER BOOK</h2>
        <div className="flex items-center gap-1"><div className="h-1.5 w-1.5 rounded-full bg-[var(--color-green)] animate-pulse" /><span className="text-[10px] text-[var(--color-dim)]">LIVE</span></div>
      </div>
      <div className="grid grid-cols-3 px-4 py-2 text-[10px] font-medium text-[var(--color-dim)]"><span>PRICE</span><span className="text-right">QTY</span><span className="text-right">TOTAL</span></div>
      <div className="flex flex-col-reverse">
        {asks.slice(0, 12).map((a, i) => <OrderRow key={`a${i}`} entry={a} maxTotal={maxTotal} isBuy={false} />)}
      </div>
      <div className="flex items-center justify-between border-y border-[var(--color-border)] bg-[var(--color-bg)]/50 px-4 py-2">
        <div className="flex items-center gap-2"><span className="text-sm font-bold text-white tabular-nums">{bids[0]?.price.toFixed(4) || "—"}</span><span className="text-[10px] text-[var(--color-dim)] hidden sm:inline">← bid</span></div>
        <div className="flex items-center gap-1"><span className="text-[10px] text-[var(--color-dim)]">spread</span><span className="text-[10px] font-medium text-[var(--color-txt)] tabular-nums">{spread.value} ({spread.pct}%)</span></div>
        <div className="flex items-center gap-2"><span className="text-[10px] text-[var(--color-dim)] hidden sm:inline">ask →</span><span className="text-sm font-bold text-[var(--color-red)] tabular-nums">{asks[0]?.price.toFixed(4) || "—"}</span></div>
      </div>
      <div className="flex flex-col">
        {bids.slice(0, 12).map((b, i) => <OrderRow key={`b${i}`} entry={b} maxTotal={maxTotal} isBuy={true} />)}
      </div>
      {bids.length === 0 && asks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-xs text-[var(--color-dim)]">No orders on the book yet</p>
          <p className="mt-1 text-[10px] text-[var(--color-dim)]">Place the first order!</p>
        </div>
      )}
    </div>
  );
}
