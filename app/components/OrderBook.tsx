"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useWallet } from "./WalletProvider";

interface BookEntry {
  price: number;
  quantity: number;
  total: number;
}

function OrderRow({
  entry,
  maxTotal,
  isBuy,
}: {
  entry: BookEntry;
  maxTotal: number;
  isBuy: boolean;
}) {
  const depthPct = Math.min(100, (entry.total / maxTotal) * 100);
  return (
    <div className="group relative grid grid-cols-3 px-3 py-[4px] text-xs hover:bg-white/[0.03]">
      <div
        className="pointer-events-none absolute inset-y-0 transition-[width] duration-200 ease-out"
        style={{
          [isBuy ? "left" : "right"]: 0,
          width: `${depthPct}%`,
          background: isBuy
            ? "rgba(61, 214, 140, 0.08)"
            : "rgba(240, 69, 90, 0.08)",
        }}
      />
      <span
        className={`relative font-mono tabular-nums ${
          isBuy ? "text-[var(--color-green)]" : "text-[var(--color-red)]"
        }`}
      >
        {entry.price.toFixed(4)}
      </span>
      <span className="relative text-right font-mono tabular-nums text-[var(--color-txt)]">
        {entry.quantity.toFixed(0)}
      </span>
      <span className="relative text-right font-mono tabular-nums text-[var(--color-dim)]">
        {entry.total.toFixed(2)}
      </span>
    </div>
  );
}

export default function OrderBook() {
  const { contract } = useWallet();
  const [bids, setBids] = useState<BookEntry[]>([]);
  const [asks, setAsks] = useState<BookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contract) return;
    let cancelled = false;

    const fetchBook = async () => {
      try {
        const [bidData, askData] = await Promise.all([
          contract.getBookSide(true, 15),
          contract.getBookSide(false, 15),
        ]);
        const formatSide = (prices: bigint[], qtys: bigint[]) => {
          let running = 0;
          return prices.map((p, i) => {
            const price = Number(p) / 1e9;
            const qty = Number(qtys[i]);
            running += price * qty;
            return { price, quantity: qty, total: running };
          });
        };
        if (!cancelled) {
          setBids(formatSide(bidData[0], bidData[1]));
          setAsks(formatSide(askData[0], askData[1]));
          setLoading(false);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load order book.");
          setLoading(false);
        }
      }
    };

    fetchBook();
    const iv = setInterval(fetchBook, 2000);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, [contract]);

  const maxTotal = useMemo(() => {
    const mb = bids[bids.length - 1]?.total || 0;
    const ma = asks[asks.length - 1]?.total || 0;
    return Math.max(mb, ma, 1);
  }, [bids, asks]);

  const spread = useMemo(() => {
    if (!asks.length || !bids.length) return null;
    const v = asks[0].price - bids[0].price;
    const pct = asks[0].price > 0 ? (v / asks[0].price) * 100 : 0;
    return { value: v, pct };
  }, [asks, bids]);

  const empty = !loading && bids.length === 0 && asks.length === 0;

  return (
    <div className="panel flex flex-col">
      <div className="panel-header">
        <h2 className="panel-title">Order book</h2>
        <div className="flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              error
                ? "bg-[var(--color-red)]"
                : "bg-[var(--color-green)] animate-pulse-dot"
            }`}
            aria-hidden
          />
          <span className="text-[10px] text-[var(--color-dim)]">
            {error ? "Error" : "Live"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 px-3 py-2 text-[10px] font-medium uppercase tracking-wide text-[var(--color-dim)]">
        <span>Price</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Total</span>
      </div>

      {loading && (
        <div className="space-y-1.5 px-3 py-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-4 w-full" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
          <p className="text-xs text-[var(--color-red)]">{error}</p>
          <p className="text-[10px] text-[var(--color-dim)]">
            Auto-retry every 2s
          </p>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="flex min-h-[120px] flex-col-reverse justify-end">
            {asks.slice(0, 12).map((a, i) => (
              <OrderRow
                key={`a-${a.price}-${i}`}
                entry={a}
                maxTotal={maxTotal}
                isBuy={false}
              />
            ))}
            {asks.length === 0 && !empty && (
              <p className="px-3 py-2 text-center text-[10px] text-[var(--color-dim)]">
                No asks
              </p>
            )}
          </div>

          <div className="flex items-center justify-between border-y border-[var(--color-border)] bg-[var(--color-bg)]/60 px-3 py-2">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wide text-[var(--color-dim)]">
                Best bid
              </span>
              <span className="font-mono text-sm font-semibold tabular-nums text-[var(--color-green)]">
                {bids[0]?.price.toFixed(4) ?? "—"}
              </span>
            </div>
            <div className="text-center">
              <span className="text-[9px] uppercase tracking-wide text-[var(--color-dim)]">
                Spread
              </span>
              <p className="font-mono text-[11px] tabular-nums text-[var(--color-muted)]">
                {spread
                  ? `${spread.value.toFixed(4)} (${spread.pct.toFixed(2)}%)`
                  : "—"}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] uppercase tracking-wide text-[var(--color-dim)]">
                Best ask
              </span>
              <span className="font-mono text-sm font-semibold tabular-nums text-[var(--color-red)]">
                {asks[0]?.price.toFixed(4) ?? "—"}
              </span>
            </div>
          </div>

          <div className="flex min-h-[120px] flex-col">
            {bids.slice(0, 12).map((b, i) => (
              <OrderRow
                key={`b-${b.price}-${i}`}
                entry={b}
                maxTotal={maxTotal}
                isBuy
              />
            ))}
            {bids.length === 0 && !empty && (
              <p className="px-3 py-2 text-center text-[10px] text-[var(--color-dim)]">
                No bids
              </p>
            )}
          </div>

          {empty && (
            <div className="border-t border-[var(--color-border)] px-4 py-8 text-center">
              <p className="text-sm font-medium text-[var(--color-muted)]">
                Book is empty
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--color-dim)]">
                Place a limit order from the panel on the right. Depth appears
                here after the transaction confirms.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
