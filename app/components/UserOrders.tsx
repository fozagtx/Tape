"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Button, Chip, Skeleton } from "@heroui/react";
import { Icon } from "@iconify/react";
import type { EventLog } from "ethers";
import { useWallet } from "./WalletProvider";
import Panel from "./ui/panel";
import ListHeader from "./ui/list-header";
import EmptyState from "./ui/empty-state";

interface UserOrder {
  id: number;
  isBuy: boolean;
  price: number;
  quantity: number;
}

const COLS =
  "grid-cols-[56px_minmax(0,1fr)_minmax(0,1fr)_44px_72px]";

export default function UserOrders() {
  const { contract, address, isConnected } = useWallet();
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const fetchOrders = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!contract || !address) return;
      if (!opts?.silent) setLoading(true);
      try {
        const filter = contract.filters.OrderPlaced(null, address);
        const events = await contract.queryFilter(filter, -5000);
        const parsed: UserOrder[] = [];
        for (const ev of events) {
          const e = ev as EventLog;
          const id = Number(e.args?.id || 0);
          try {
            const order = await contract.getOrder(id);
            if (Number(order.quantity) > 0) {
              parsed.push({
                id,
                isBuy: order.isBuy,
                price: Number(order.price) / 1e9,
                quantity: Number(order.quantity),
              });
            }
          } catch {
            /* skip */
          }
        }
        setOrders(parsed.reverse());
        setError(null);
      } catch {
        setError("Could not load your open orders.");
      } finally {
        setLoading(false);
      }
    },
    [contract, address]
  );

  useEffect(() => {
    if (!contract || !address) return;
    let cancelled = false;
    void (async () => {
      await fetchOrders();
      if (cancelled) return;
    })();
    const iv = setInterval(() => {
      void fetchOrders({ silent: true });
    }, 5000);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, [fetchOrders, contract, address]);

  const handleCancel = async (id: number) => {
    if (!contract) return;
    setCancelling(id);
    setCancelError(null);
    try {
      const tx = await contract.cancelOrder(id);
      await tx.wait();
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Cancel failed";
      setCancelError(
        msg.includes("user rejected")
          ? "Cancel rejected in wallet."
          : "Could not cancel order. Try again."
      );
    } finally {
      setCancelling(null);
    }
  };

  if (!isConnected) {
    return (
      <Panel flush className="min-h-72" title="My orders">
        <EmptyState
          icon="solar:wallet-linear"
          title="Connect wallet"
          description="See and cancel your open orders."
        />
      </Panel>
    );
  }

  return (
    <Panel
      flush
      className="min-h-72"
      title="My orders"
      endContent={
        <>
          <Chip size="sm" variant="flat">
            {loading && orders.length === 0
              ? "Loading…"
              : `${orders.length} open`}
          </Chip>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            aria-label="Refresh orders"
            className="min-h-8 min-w-8"
            isDisabled={loading}
            onPress={() => void fetchOrders()}
          >
            <Icon icon="solar:refresh-linear" width={16} />
          </Button>
        </>
      }
    >
      {cancelError && (
        <div
          role="alert"
          className="mx-4 mt-4 rounded-medium border border-danger/25 bg-danger/10 px-4 py-3 text-tiny text-danger"
        >
          {cancelError}
        </div>
      )}

      {loading && orders.length === 0 && (
        <div className="space-y-2 px-4 py-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-md" />
          ))}
        </div>
      )}

      {error && (
        <EmptyState icon="solar:danger-triangle-linear" title={error}>
          <Button
            size="sm"
            variant="flat"
            color="warning"
            onPress={() => void fetchOrders()}
          >
            Retry
          </Button>
        </EmptyState>
      )}

      {!error && !loading && orders.length === 0 && (
        <EmptyState
          icon="solar:clipboard-list-linear"
          title="No open orders"
          description="Resting limits show here until they fill or you cancel them."
        />
      )}

      {!error && orders.length > 0 && (
        <div className="max-h-64 overflow-x-auto overflow-y-auto">
          <div className="min-w-[300px]">
            <ListHeader
              className={COLS}
              columns={[
                { key: "s", label: "Side" },
                { key: "p", label: "Price" },
                { key: "q", label: "Qty" },
                { key: "i", label: "ID" },
                { key: "a", label: " " },
              ]}
            />
            {orders.map((o) => (
              <div
                key={o.id}
                className={`grid ${COLS} items-center gap-2 px-4 py-1.5 text-small hover:bg-default-100/40`}
              >
                <Chip
                  size="sm"
                  variant="flat"
                  color={o.isBuy ? "success" : "danger"}
                  classNames={{ content: "text-tiny font-semibold" }}
                >
                  {o.isBuy ? "Buy" : "Sell"}
                </Chip>
                <span className="font-mono tabular-nums text-default-700">
                  {o.price.toFixed(4)}
                </span>
                <span className="font-mono tabular-nums text-default-700">
                  {o.quantity}
                </span>
                <span className="font-mono text-default-400">#{o.id}</span>
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="flat"
                    color="danger"
                    className="min-h-8 min-w-16 px-2 text-tiny"
                    isLoading={cancelling === o.id}
                    onPress={() => void handleCancel(o.id)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Panel>
  );
}
