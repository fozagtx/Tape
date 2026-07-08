"use client";

import React from "react";
import { Card, Chip, Skeleton, cn } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useMarket } from "./MarketProvider";

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
      className="border border-default-100 bg-content1"
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
  const { ready, live, error, stats } = useMarket();

  const mid =
    stats.bestBid != null && stats.bestAsk != null
      ? (stats.bestBid + stats.bestAsk) / 2
      : (stats.bestBid ?? stats.bestAsk);

  const loading = !ready;

  const cards: TrendCardProps[] = [
    {
      title: "Mid / last",
      value: loading ? null : mid != null ? mid.toFixed(4) : "-",
      hint: mid != null ? "gwei" : "no quote",
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
      hint: live ? "live" : `${stats.totalOrders} orders`,
      changeType: "neutral",
      icon: "solar:transfer-horizontal-linear",
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <div
          role="alert"
          className="rounded-medium border border-warning/30 bg-warning/10 px-4 py-3 text-tiny text-warning sm:text-small"
        >
          {error}
        </div>
      )}
      <dl className="grid w-full grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
        {cards.map((c) => (
          <TrendCard key={c.title} {...c} />
        ))}
      </dl>
    </div>
  );
}
