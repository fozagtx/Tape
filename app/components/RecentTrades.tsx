"use client";

import React from "react";
import { Chip, Skeleton } from "@heroui/react";
import { useMarket } from "./MarketProvider";
import Panel from "./ui/panel";
import ListHeader from "./ui/list-header";
import EmptyState from "./ui/empty-state";

export default function RecentTrades() {
  const { ready, live, error, trades } = useMarket();
  const loading = !ready;

  return (
    <Panel
      flush
      className="min-h-72"
      title="Recent trades"
      endContent={
        <Chip size="sm" variant="flat" color={live ? "success" : "default"}>
          {loading ? "…" : live ? `${trades.length} live` : `${trades.length}`}
        </Chip>
      }
    >
      <ListHeader
        className="grid-cols-3"
        columns={[
          { key: "p", label: "Price" },
          { key: "q", label: "Qty", align: "right" },
          { key: "m", label: "Match", align: "right" },
        ]}
      />

      <div className="max-h-64 overflow-y-auto">
        {loading && (
          <div className="space-y-2 px-4 py-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full rounded-sm" />
            ))}
          </div>
        )}

        {!loading && error && trades.length === 0 && (
          <EmptyState
            icon="solar:danger-triangle-linear"
            title="Trades offline"
            description={error}
          />
        )}

        {!loading && !error && trades.length === 0 && (
          <EmptyState
            icon="solar:list-linear"
            title="No fills yet"
            description="Matches appear here in real time when orders cross."
          />
        )}

        {!loading &&
          trades.map((t) => (
            <div
              key={t.key}
              className="grid grid-cols-3 gap-2 px-4 py-1.5 text-small hover:bg-default-100/40"
            >
              <span className="font-mono tabular-nums text-default-700">
                {t.price.toFixed(4)}
              </span>
              <span className="text-right font-mono tabular-nums text-default-700">
                {t.quantity}
              </span>
              <span
                className="truncate text-right font-mono text-tiny text-default-400"
                title={`#${t.buyId}×#${t.sellId}`}
              >
                #{t.buyId}×#{t.sellId}
              </span>
            </div>
          ))}
      </div>
    </Panel>
  );
}
