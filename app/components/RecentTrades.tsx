"use client";

import React, { useEffect, useState } from "react";
import { Chip, Skeleton } from "@heroui/react";
import type { EventLog } from "ethers";
import { useWallet } from "./WalletProvider";
import Panel from "./ui/panel";
import ListHeader from "./ui/list-header";
import EmptyState from "./ui/empty-state";

interface TradeEvent {
  price: number;
  quantity: number;
  buyId: string;
  sellId: string;
  key: string;
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
    <Panel
      flush
      className="min-h-72"
      title="Recent trades"
      endContent={
        <Chip size="sm" variant="flat">
          {loading ? "…" : `${trades.length} shown`}
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

        {!loading && error && (
          <EmptyState icon="solar:danger-triangle-linear" title={error} />
        )}

        {!loading && !error && trades.length === 0 && (
          <EmptyState
            icon="solar:list-linear"
            title="No fills yet"
            description="When a buy and sell cross, the match prints here."
          />
        )}

        {!loading &&
          !error &&
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
