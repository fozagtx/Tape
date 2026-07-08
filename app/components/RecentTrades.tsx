"use client";

import React, { useEffect, useState } from "react";
import { useWallet } from "./WalletProvider";
import type { EventLog } from "ethers";

interface TradeEvent {
  price: number;
  quantity: number;
  buyId: string;
  sellId: string;
  key: string;
}

function formatMatch(buyId: string, sellId: string) {
  return `#${buyId}×#${sellId}`;
}

export default function RecentTrades() {
  const { contract } = useWallet();
  const [trades, setTrades] = useState<TradeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contract) return;
    let cancelled = false;

    const filter = contract.filters.OrderMatched();
    contract
      .queryFilter(filter, -1000)
      .then((events) => {
        if (cancelled) return;
        const parsed = events
          .map((ev, idx) => {
            const e = ev as EventLog;
            const buyId = String(e.args?.buyId ?? 0);
            const sellId = String(e.args?.sellId ?? 0);
            return {
              price: Number(e.args?.price || 0) / 1e9,
              quantity: Number(e.args?.quantity || 0),
              buyId,
              sellId,
              key: `${e.transactionHash ?? idx}-${buyId}-${sellId}`,
            };
          })
          .reverse()
          .slice(0, 30);
        setTrades(parsed);
        setLoading(false);
        setError(null);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not load trades.");
          setLoading(false);
        }
      });

    const onMatch = (
      buyId: bigint,
      sellId: bigint,
      _buyer: string,
      _seller: string,
      price: bigint,
      qty: bigint
    ) => {
      setTrades((prev) =>
        [
          {
            price: Number(price) / 1e9,
            quantity: Number(qty),
            buyId: String(buyId),
            sellId: String(sellId),
            key: `${Date.now()}-${buyId}-${sellId}`,
          },
          ...prev,
        ].slice(0, 30)
      );
    };

    contract.on("OrderMatched", onMatch);
    return () => {
      cancelled = true;
      contract.off("OrderMatched", onMatch);
    };
  }, [contract]);

  return (
    <div className="panel flex flex-col">
      <div className="panel-header">
        <h2 className="panel-title">Recent trades</h2>
        <span className="text-[10px] text-[var(--color-dim)]">
          {loading ? "…" : `${trades.length} shown`}
        </span>
      </div>

      <div className="grid grid-cols-3 px-3 py-2 text-[10px] font-medium uppercase tracking-wide text-[var(--color-dim)]">
        <span>Price</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Match</span>
      </div>

      <div className="max-h-[280px] overflow-y-auto">
        {loading && (
          <div className="space-y-1.5 px-3 py-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-4 w-full" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="px-4 py-8 text-center">
            <p className="text-xs text-[var(--color-red)]">{error}</p>
          </div>
        )}

        {!loading && !error && trades.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-sm font-medium text-[var(--color-muted)]">
              No fills yet
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--color-dim)]">
              When a buy and sell cross, the match prints here with the fill
              price and size.
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          trades.map((t) => (
            <div
              key={t.key}
              className="grid grid-cols-3 px-3 py-[5px] text-xs hover:bg-white/[0.03]"
            >
              <span className="font-mono tabular-nums text-[var(--color-txt)]">
                {t.price.toFixed(4)}
              </span>
              <span className="text-right font-mono tabular-nums text-[var(--color-txt)]">
                {t.quantity}
              </span>
              <span
                className="truncate text-right font-mono text-[10px] text-[var(--color-dim)]"
                title={formatMatch(t.buyId, t.sellId)}
              >
                {formatMatch(t.buyId, t.sellId)}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
