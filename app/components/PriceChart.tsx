"use client";

import React from "react";

export default function PriceChart() {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <h3 className="mb-2 text-xs font-bold tracking-wider text-white">PRICE CHART</h3>
      <div className="flex h-32 items-center justify-center text-center">
        <p className="text-xs text-[var(--color-dim)]">Chart data from live trades will appear here</p>
      </div>
      <p className="mt-2 text-[10px] text-[var(--color-dim)]">Connect contract and start trading to see price history</p>
    </div>
  );
}
