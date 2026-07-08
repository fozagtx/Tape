"use client";

import React, { useMemo } from "react";
import { Chip, Skeleton, cn } from "@heroui/react";
import { useMarket } from "./MarketProvider";
import Panel from "./ui/panel";
import ListHeader from "./ui/list-header";
import EmptyState from "./ui/empty-state";
import type { BookEntry } from "../hooks/useMarketLive";

const OrderRow = React.forwardRef<
  HTMLDivElement,
  { entry: BookEntry; maxTotal: number; isBuy: boolean }
>(({ entry, maxTotal, isBuy }, ref) => {
  const depthPct = Math.min(100, (entry.total / maxTotal) * 100);
  return (
    <div
      ref={ref}
      className="relative grid grid-cols-3 gap-2 px-4 py-1.5 text-small"
    >
      <div
        className="pointer-events-none absolute inset-y-0 transition-[width] duration-200 ease-out"
        style={{
          [isBuy ? "left" : "right"]: 0,
          width: `${depthPct}%`,
          background: isBuy
            ? "hsl(var(--heroui-success) / 0.1)"
            : "hsl(var(--heroui-danger) / 0.1)",
        }}
      />
      <span
        className={cn(
          "relative font-mono tabular-nums",
          isBuy ? "text-success" : "text-danger"
        )}
      >
        {entry.price.toFixed(4)}
      </span>
      <span className="relative text-right font-mono tabular-nums text-default-700">
        {entry.quantity.toFixed(0)}
      </span>
      <span className="relative text-right font-mono tabular-nums text-default-400">
        {entry.total.toFixed(2)}
      </span>
    </div>
  );
});
OrderRow.displayName = "OrderRow";

export default function OrderBook() {
  const { ready, live, error, bids, asks } = useMarket();

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

  const empty = ready && !error && bids.length === 0 && asks.length === 0;
  const loading = !ready;

  return (
    <Panel
      flush
      title="Order book"
      endContent={
        <Chip
          size="sm"
          variant="flat"
          color={error ? "danger" : live ? "success" : "default"}
          startContent={
            <span
              className={cn(
                "mx-0.5 h-1.5 w-1.5 rounded-full",
                error ? "bg-danger" : live ? "bg-success" : "bg-default-400"
              )}
            />
          }
        >
          {error ? "Offline" : live ? "Live" : "…"}
        </Chip>
      }
    >
      <ListHeader
        className="grid-cols-3"
        columns={[
          { key: "p", label: "Price" },
          { key: "q", label: "Qty", align: "right" },
          { key: "t", label: "Total", align: "right" },
        ]}
      />

      {loading && (
        <div className="space-y-2 px-4 py-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full rounded-sm" />
          ))}
        </div>
      )}

      {!loading && error && (
        <EmptyState
          icon="solar:danger-triangle-linear"
          title="Book offline"
          description={error}
        />
      )}

      {!loading && !error && (
        <>
          <div className="flex min-h-28 flex-col-reverse justify-end">
            {asks.slice(0, 12).map((a, i) => (
              <OrderRow
                key={`a-${a.price}-${i}`}
                entry={a}
                maxTotal={maxTotal}
                isBuy={false}
              />
            ))}
            {asks.length === 0 && !empty && (
              <p className="px-4 py-2 text-center text-tiny text-default-400">
                No asks
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-y border-default-100 bg-content2/60 px-4 py-3">
            <div className="min-w-0">
              <p className="text-tiny uppercase tracking-wide text-default-400">
                Best bid
              </p>
              <p className="truncate font-mono text-small font-semibold tabular-nums text-success">
                {bids[0]?.price.toFixed(4) ?? "-"}
              </p>
            </div>
            <div className="min-w-0 text-center">
              <p className="text-tiny uppercase tracking-wide text-default-400">
                Spread
              </p>
              <p className="truncate font-mono text-tiny tabular-nums text-default-500">
                {spread
                  ? `${spread.value.toFixed(4)} (${spread.pct.toFixed(2)}%)`
                  : "-"}
              </p>
            </div>
            <div className="min-w-0 text-right">
              <p className="text-tiny uppercase tracking-wide text-default-400">
                Best ask
              </p>
              <p className="truncate font-mono text-small font-semibold tabular-nums text-danger">
                {asks[0]?.price.toFixed(4) ?? "-"}
              </p>
            </div>
          </div>

          <div className="flex min-h-28 flex-col">
            {bids.slice(0, 12).map((b, i) => (
              <OrderRow
                key={`b-${b.price}-${i}`}
                entry={b}
                maxTotal={maxTotal}
                isBuy
              />
            ))}
            {bids.length === 0 && !empty && (
              <p className="px-4 py-2 text-center text-tiny text-default-400">
                No bids
              </p>
            )}
          </div>

          {empty && (
            <EmptyState
              icon="solar:book-linear"
              title="Book is empty"
              description="Place a limit order. Depth updates live after the tx confirms."
            />
          )}
        </>
      )}
    </Panel>
  );
}
