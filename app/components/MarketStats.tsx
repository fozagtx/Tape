"use client";

import React, { useEffect, useState } from "react";
import { useWallet } from "./WalletProvider";

interface Stats {
  totalOrders: number;
  bids: number;
  asks: number;
  matches: number;
  bestBid: number | null;
  bestAsk: number | null;
}

const EMPTY: Stats = {
  totalOrders: 0,
  bids: 0,
  asks: 0,
  matches: 0,
  bestBid: null,
  bestAsk: null,
};

export default function MarketStats() {
  const { contract } = useWallet();
  const [stats, setStats] = useState<Stats>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!contract) return;
    let cancelled = false;

    const fetchStats = async () => {
      try {
        const [total, bids, asks, matches] = await contract.stats();
        let bestBid: number | null = null;
        let bestAsk: number | null = null;
        try {
          const bb = await contract.getBestBid();
          const ba = await contract.getBestAsk();
          const bp = Number(bb.price ?? bb[0] ?? 0) / 1e9;
          const ap = Number(ba.price ?? ba[0] ?? 0) / 1e9;
          bestBid = bp > 0 ? bp : null;
          bestAsk = ap > 0 ? ap : null;
        } catch {
          /* optional */
        }
        if (!cancelled) {
          setStats({
            totalOrders: Number(total),
            bids: Number(bids),
            asks: Number(asks),
            matches: Number(matches),
            bestBid,
            bestAsk,
          });
          setLoading(false);
          setFailed(false);
        }
      } catch {
        if (!cancelled) {
          setFailed(true);
          setLoading(false);
        }
      }
    };

    fetchStats();
    const iv = setInterval(fetchStats, 3000);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, [contract]);

  const mid =
    stats.bestBid != null && stats.bestAsk != null
      ? (stats.bestBid + stats.bestAsk) / 2
      : stats.bestBid ?? stats.bestAsk;

  const cards = [
    {
      label: "Mid / last",
      value:
        mid != null
          ? mid.toFixed(4)
          : loading
            ? null
            : "—",
      sub: mid != null ? "gwei" : "no quote yet",
      accent: "var(--color-white)",
    },
    {
      label: "Open bids",
      value: loading ? null : String(stats.bids),
      sub: "resting",
      accent: "var(--color-green)",
    },
    {
      label: "Open asks",
      value: loading ? null : String(stats.asks),
      sub: "resting",
      accent: "var(--color-red)",
    },
    {
      label: "Matches",
      value: loading ? null : String(stats.matches),
      sub: `${stats.totalOrders} orders ever`,
      accent: "var(--color-accent)",
    },
  ];

  return (
    <div>
      {failed && (
        <p className="mb-2 text-xs text-[var(--color-red)]">
          Could not refresh market stats. Retrying…
        </p>
      )}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="flex flex-col gap-1 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2.5"
          >
            <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-dim)]">
              {c.label}
            </span>
            {c.value == null ? (
              <span className="skeleton h-6 w-16" />
            ) : (
              <span
                className="font-mono text-lg font-semibold tabular-nums"
                style={{ color: c.accent }}
              >
                {c.value}
              </span>
            )}
            <span className="text-[10px] text-[var(--color-dim)]">{c.sub}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
