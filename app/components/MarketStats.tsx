"use client";

import React, { useState, useEffect } from "react";
import { useWallet } from "./WalletProvider";

interface Stats { totalOrders: number; bids: number; asks: number; matches: number; }

export default function MarketStats() {
  const { contract } = useWallet();
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, bids: 0, asks: 0, matches: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      if (!contract) return;
      try {
        const [total, bids, asks, matches] = await contract.stats();
        setStats({ totalOrders: Number(total), bids: Number(bids), asks: Number(asks), matches: Number(matches) });
      } catch { /* silent */ }
    };
    fetchStats();
    const iv = setInterval(fetchStats, 3000);
    return () => clearInterval(iv);
  }, [contract]);

  const cards = [
    { label: "Total Orders", value: stats.totalOrders, color: "white" },
    { label: "Active Bids", value: stats.bids, color: "var(--color-green)" },
    { label: "Active Asks", value: stats.asks, color: "var(--color-red)" },
    { label: "Total Matches", value: stats.matches, color: "var(--color-accent)" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="flex flex-col gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-3 transition-all">
          <span className="text-[10px] font-medium text-[var(--color-dim)]">{c.label}</span>
          <span className="text-lg font-bold tabular-nums" style={{ color: c.color }}>{c.value}</span>
        </div>
      ))}
    </div>
  );
}
