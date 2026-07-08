"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useWallet } from "./WalletProvider";
import type { EventLog } from "ethers";

interface Point {
  price: number;
  ts: number;
}

export default function PriceChart() {
  const { contract } = useWallet();
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contract) return;
    let cancelled = false;

    void (async () => {
      try {
        const filter = contract.filters.OrderMatched();
        const events = await contract.queryFilter(filter, -2000);
        if (cancelled) return;
        const provider = contract.runner?.provider;
        const parsed: Point[] = [];
        const blockCache = new Map<number, number>();

        for (const ev of events) {
          const e = ev as EventLog;
          const price = Number(e.args?.price || 0) / 1e9;
          if (!(price > 0)) continue;
          let ts = Date.now();
          const bn = e.blockNumber;
          if (provider && typeof bn === "number") {
            if (!blockCache.has(bn)) {
              try {
                const block = await provider.getBlock(bn);
                blockCache.set(
                  bn,
                  block?.timestamp ? block.timestamp * 1000 : Date.now()
                );
              } catch {
                blockCache.set(bn, Date.now());
              }
            }
            ts = blockCache.get(bn) ?? Date.now();
          }
          parsed.push({ price, ts });
        }

        if (!cancelled) {
          setPoints(parsed.slice(-80));
          setError(null);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError("Could not load trade history.");
          setLoading(false);
        }
      }
    })();

    const onMatch = (
      _buyId: bigint,
      _sellId: bigint,
      _buyer: string,
      _seller: string,
      price: bigint
    ) => {
      const p = Number(price) / 1e9;
      if (!(p > 0)) return;
      setPoints((prev) => [...prev, { price: p, ts: Date.now() }].slice(-80));
    };

    contract.on("OrderMatched", onMatch);
    return () => {
      cancelled = true;
      contract.off("OrderMatched", onMatch);
    };
  }, [contract]);

  const chart = useMemo(() => {
    if (points.length === 0) return null;
    const prices = points.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || max * 0.01 || 1;
    const pad = range * 0.08;
    const yMin = min - pad;
    const yMax = max + pad;
    const yRange = yMax - yMin || 1;

    const W = 400;
    const H = 140;
    const coords = points.map((p, i) => {
      const x =
        points.length === 1 ? W / 2 : (i / (points.length - 1)) * W;
      const y = H - ((p.price - yMin) / yRange) * H;
      return { x, y, price: p.price };
    });

    const line = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x},${c.y}`).join(" ");
    const area =
      line +
      ` L${coords[coords.length - 1].x},${H} L${coords[0].x},${H} Z`;

    const first = prices[0];
    const last = prices[prices.length - 1];
    const up = last >= first;
    const changePct =
      first > 0 ? (((last - first) / first) * 100).toFixed(2) : "0.00";

    return {
      line,
      area,
      last,
      first,
      up,
      changePct,
      min,
      max,
      W,
      H,
      stroke: up ? "var(--color-green)" : "var(--color-red)",
      fill: up
        ? "rgba(61, 214, 140, 0.12)"
        : "rgba(240, 69, 90, 0.12)",
    };
  }, [points]);

  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Price</h2>
        {chart && (
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-sm font-semibold tabular-nums text-[var(--color-white)]">
              {chart.last.toFixed(4)}
            </span>
            <span
              className={`font-mono text-[10px] tabular-nums ${
                chart.up
                  ? "text-[var(--color-green)]"
                  : "text-[var(--color-red)]"
              }`}
            >
              {chart.up ? "+" : ""}
              {chart.changePct}%
            </span>
            <span className="text-[10px] text-[var(--color-dim)]">gwei</span>
          </div>
        )}
      </div>

      <div className="px-3 pb-3 pt-2">
        {loading && (
          <div className="flex h-[140px] flex-col justify-end gap-2">
            <div className="skeleton h-full w-full rounded-md" />
          </div>
        )}

        {!loading && error && (
          <div className="flex h-[140px] flex-col items-center justify-center gap-2 text-center">
            <p className="text-xs text-[var(--color-red)]">{error}</p>
            <p className="text-[10px] text-[var(--color-dim)]">
              Trades will chart automatically once matches land on-chain.
            </p>
          </div>
        )}

        {!loading && !error && !chart && (
          <div className="flex h-[140px] flex-col items-center justify-center gap-1.5 px-4 text-center">
            <p className="text-sm font-medium text-[var(--color-muted)]">
              No trades yet
            </p>
            <p className="max-w-xs text-xs leading-relaxed text-[var(--color-dim)]">
              Place a buy and a sell at overlapping prices to print a match.
              The price line builds from real on-chain fills only.
            </p>
          </div>
        )}

        {!loading && !error && chart && (
          <div className="relative">
            <svg
              viewBox={`0 0 ${chart.W} ${chart.H}`}
              className="h-[140px] w-full"
              preserveAspectRatio="none"
              role="img"
              aria-label={`Price chart, last ${chart.last.toFixed(4)} gwei`}
            >
              <defs>
                <linearGradient id="tapePriceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chart.stroke} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={chart.stroke} stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Mid grid */}
              <line
                x1="0"
                y1={chart.H / 2}
                x2={chart.W}
                y2={chart.H / 2}
                stroke="var(--color-border)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              <path d={chart.area} fill="url(#tapePriceFill)" />
              <path
                d={chart.line}
                fill="none"
                stroke={chart.stroke}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <div className="mt-1 flex justify-between text-[10px] text-[var(--color-dim)]">
              <span className="font-mono tabular-nums">
                Low {chart.min.toFixed(4)}
              </span>
              <span className="text-[var(--color-dim)]">
                {points.length} fill{points.length === 1 ? "" : "s"}
              </span>
              <span className="font-mono tabular-nums">
                High {chart.max.toFixed(4)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
