"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, Chip, Skeleton, Spacer, cn } from "@heroui/react";
import { Icon } from "@iconify/react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { EventLog } from "ethers";
import { useWallet } from "./WalletProvider";
import EmptyState from "./ui/empty-state";

interface Point {
  price: number;
  ts: number;
  label: string;
}

/** design-promax Graphs pattern — Card + AreaChart + Chip delta */
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
          parsed.push({
            price,
            ts,
            label: new Date(ts).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          });
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
      _a: bigint,
      _b: bigint,
      _c: string,
      _d: string,
      price: bigint
    ) => {
      const p = Number(price) / 1e9;
      if (!(p > 0)) return;
      const ts = Date.now();
      setPoints((prev) =>
        [
          ...prev,
          {
            price: p,
            ts,
            label: new Date(ts).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ].slice(-80)
      );
    };

    contract.on("OrderMatched", onMatch);
    return () => {
      cancelled = true;
      contract.off("OrderMatched", onMatch);
    };
  }, [contract]);

  const summary = useMemo(() => {
    if (points.length === 0) return null;
    const prices = points.map((p) => p.price);
    const first = prices[0];
    const last = prices[prices.length - 1];
    const up = last >= first;
    const changePct =
      first > 0 ? (((last - first) / first) * 100).toFixed(2) : "0.00";
    return {
      last,
      up,
      changePct,
      min: Math.min(...prices),
      max: Math.max(...prices),
      changeType: up ? ("positive" as const) : ("negative" as const),
    };
  }, [points]);

  return (
    <Card
      as="dl"
      className="border border-transparent dark:border-default-100"
      shadow="none"
    >
      <section className="flex flex-col p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <dt className="text-medium font-medium text-foreground">Price</dt>
            <p className="text-tiny text-default-500">
              On-chain fills only · gwei
            </p>
          </div>
          {summary && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-large font-semibold tabular-nums text-default-700">
                {summary.last.toFixed(4)}
              </span>
              <Chip
                classNames={{ content: "font-medium text-tiny" }}
                color={
                  summary.changeType === "positive" ? "success" : "danger"
                }
                radius="sm"
                size="sm"
                variant="flat"
                startContent={
                  <Icon
                    height={12}
                    width={12}
                    aria-hidden
                    icon={
                      summary.up
                        ? "solar:arrow-right-up-linear"
                        : "solar:arrow-right-down-linear"
                    }
                  />
                }
              >
                {summary.up ? "+" : ""}
                {summary.changePct}%
              </Chip>
            </div>
          )}
        </div>

        <Spacer y={4} />

        {loading && <Skeleton className="h-44 w-full rounded-medium" />}

        {!loading && error && (
          <EmptyState
            className="h-44 py-0"
            icon="solar:danger-triangle-linear"
            title={error}
          />
        )}

        {!loading && !error && !summary && (
          <EmptyState
            className="h-44 py-0"
            icon="solar:chart-linear"
            title="No trades yet"
            description="Place a buy and sell at overlapping prices to print a match. Chart builds from real on-chain fills only."
          />
        )}

        {!loading && !error && summary && (
          <div className="h-44 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={points}
                margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="tapePrice" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={
                        summary.up
                          ? "hsl(var(--heroui-success))"
                          : "hsl(var(--heroui-danger))"
                      }
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="100%"
                      stopColor={
                        summary.up
                          ? "hsl(var(--heroui-success))"
                          : "hsl(var(--heroui-danger))"
                      }
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="hsl(var(--heroui-default-100))"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{
                    fontSize: 11,
                    fill: "hsl(var(--heroui-default-400))",
                  }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={28}
                />
                <YAxis
                  domain={["auto", "auto"]}
                  width={44}
                  tick={{
                    fontSize: 11,
                    fill: "hsl(var(--heroui-default-400))",
                  }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => Number(v).toFixed(2)}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--heroui-content1))",
                    border: "1px solid hsl(var(--heroui-default-100))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "hsl(var(--heroui-default-500))" }}
                  formatter={(value) => [
                    `${Number(value).toFixed(4)} gwei`,
                    "Price",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={
                    summary.up
                      ? "hsl(var(--heroui-success))"
                      : "hsl(var(--heroui-danger))"
                  }
                  fill="url(#tapePrice)"
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {summary && (
          <>
            <Spacer y={2} />
            <div className="flex justify-between gap-3 text-tiny text-default-400">
              <span className="font-mono tabular-nums">
                Low {summary.min.toFixed(4)}
              </span>
              <span
                className={cn(
                  "font-mono tabular-nums",
                  summary.up ? "text-success" : "text-danger"
                )}
              >
                {points.length} fill{points.length === 1 ? "" : "s"}
              </span>
              <span className="font-mono tabular-nums">
                High {summary.max.toFixed(4)}
              </span>
            </div>
          </>
        )}
      </section>
    </Card>
  );
}
