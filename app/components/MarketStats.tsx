"use client";

import React, { useEffect, useState } from "react";
import { Card, Chip, Skeleton, cn } from "@heroui/react";
import { Icon } from "@iconify/react";
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

/** design-promax KPI TrendCard pattern */
type TrendCardProps = {
  title: string;
  value: string | null;
  hint: string;
  changeType: "positive" | "negative" | "neutral" | "warning";
  icon: string;
};

const TrendCard = React.forwardRef<HTMLDivElement, TrendCardProps>(
  ({ title, value, hint, changeType, icon }, ref) => (
    <Card
      ref={ref}
      as="div"
      className="border border-transparent dark:border-default-100"
      shadow="none"
    >
      <div className="relative flex p-4">
        <div className="flex min-w-0 flex-col gap-y-2 pr-10">
          <dt className="text-small font-medium text-default-500">{title}</dt>
          {value == null ? (
            <Skeleton className="h-8 w-16 rounded-md" />
          ) : (
            <dd
              className={cn(
                "truncate font-mono text-2xl font-semibold tabular-nums text-default-700",
                {
                  "text-success": changeType === "positive",
                  "text-danger": changeType === "negative",
                  "text-warning": changeType === "warning",
                }
              )}
            >
              {value}
            </dd>
          )}
          <span className="truncate text-tiny text-default-400">{hint}</span>
        </div>
        <Chip
          className="absolute right-4 top-4"
          classNames={{ content: "font-medium text-tiny p-0" }}
          color={
            changeType === "positive"
              ? "success"
              : changeType === "negative"
                ? "danger"
                : changeType === "warning"
                  ? "warning"
                  : "default"
          }
          radius="sm"
          size="sm"
          variant="flat"
        >
          <Icon height={12} width={12} icon={icon} aria-hidden />
        </Chip>
      </div>
    </Card>
  )
);
TrendCard.displayName = "TrendCard";

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

    void fetchStats();
    const iv = setInterval(fetchStats, 3000);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, [contract]);

  const mid =
    stats.bestBid != null && stats.bestAsk != null
      ? (stats.bestBid + stats.bestAsk) / 2
      : (stats.bestBid ?? stats.bestAsk);

  const cards: TrendCardProps[] = [
    {
      title: "Mid / last",
      value: mid != null ? mid.toFixed(4) : loading ? null : "—",
      hint: mid != null ? "gwei" : "no quote yet",
      changeType: "warning",
      icon: "solar:chart-2-linear",
    },
    {
      title: "Open bids",
      value: loading ? null : String(stats.bids),
      hint: "resting",
      changeType: "positive",
      icon: "solar:arrow-up-linear",
    },
    {
      title: "Open asks",
      value: loading ? null : String(stats.asks),
      hint: "resting",
      changeType: "negative",
      icon: "solar:arrow-down-linear",
    },
    {
      title: "Matches",
      value: loading ? null : String(stats.matches),
      hint: `${stats.totalOrders} orders ever`,
      changeType: "neutral",
      icon: "solar:transfer-horizontal-linear",
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      {failed && (
        <p className="text-tiny text-danger">
          Could not refresh market stats. Retrying…
        </p>
      )}
      {/* design-promax KPI grid: gap-5, 1→2→4 cols */}
      <dl className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {cards.map((c) => (
          <TrendCard key={c.title} {...c} />
        ))}
      </dl>
    </div>
  );
}
