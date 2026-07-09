"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Contract } from "ethers";
import type { EventLog } from "ethers";
import { isRpcThrottleError } from "@/lib/rpc";

export type BookEntry = {
  price: number;
  quantity: number;
  total: number;
};

export type MarketStats = {
  totalOrders: number;
  bids: number;
  asks: number;
  matches: number;
  bestBid: number | null;
  bestAsk: number | null;
};

export type TradeRow = {
  price: number;
  quantity: number;
  buyId: string;
  sellId: string;
  key: string;
  ts: number;
};

export type MarketLive = {
  ready: boolean;
  live: boolean;
  error: string | null;
  stats: MarketStats;
  bids: BookEntry[];
  asks: BookEntry[];
  trades: TradeRow[];
  refresh: () => Promise<void>;
  /** Full refresh including trade history (call after place/cancel) */
  refreshAll: () => Promise<void>;
};

const EMPTY_STATS: MarketStats = {
  totalOrders: 0,
  bids: 0,
  asks: 0,
  matches: 0,
  bestBid: null,
  bestAsk: null,
};

const POLL_MS = 5000;

function toArr(x: unknown): bigint[] {
  if (Array.isArray(x)) return x as bigint[];
  if (x && typeof x === "object" && "length" in (x as object)) {
    return Array.from(x as ArrayLike<bigint>);
  }
  return [];
}

function formatSide(pricesRaw: unknown, qtysRaw: unknown): BookEntry[] {
  const prices = toArr(pricesRaw);
  const qtys = toArr(qtysRaw);
  let running = 0;
  return prices.map((p, i) => {
    const price = Number(p) / 1e9;
    const qty = Number(qtys[i] ?? 0);
    running += price * qty;
    return { price, quantity: qty, total: running };
  });
}

/**
 * Live market data from the real on-chain TapeOrderBook.
 * No mocks — zeros mean empty book or no fills yet.
 */
export function useMarketLive(contract: Contract | null): MarketLive {
  const [ready, setReady] = useState(false);
  const [live, setLive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<MarketStats>(EMPTY_STATS);
  const [bids, setBids] = useState<BookEntry[]>([]);
  const [asks, setAsks] = useState<BookEntry[]>([]);
  const [trades, setTrades] = useState<TradeRow[]>([]);
  const contractRef = useRef(contract);
  const inflight = useRef(false);
  contractRef.current = contract;

  const loadTrades = useCallback(async () => {
    const c = contractRef.current;
    if (!c) return;
    try {
      const filter = c.filters.OrderMatched();
      const events = await c.queryFilter(filter, -300);
      const rows: TradeRow[] = events
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
            ts: Date.now() - (events.length - idx) * 750,
          };
        })
        .reverse()
        .slice(0, 40);
      setTrades(rows);
    } catch {
      /* history optional when RPC is busy */
    }
  }, []);

  const refresh = useCallback(async () => {
    const c = contractRef.current;
    if (!c || inflight.current) return;
    inflight.current = true;

    try {
      const [statsRaw, bidData, askData] = await Promise.all([
        c.stats(),
        c.getBookSide(true, 15),
        c.getBookSide(false, 15),
      ]);

      const bidSide = formatSide(bidData[0] ?? bidData.prices, bidData[1] ?? bidData.quantities);
      const askSide = formatSide(askData[0] ?? askData.prices, askData[1] ?? askData.quantities);

      // Prefer live book depth counts when counter is stale (cancel bug)
      const openBids = bidSide.length;
      const openAsks = askSide.length;

      setStats({
        totalOrders: Number(statsRaw[0]),
        bids: openBids,
        asks: openAsks,
        matches: Number(statsRaw[3]),
        bestBid: bidSide[0]?.price ?? null,
        bestAsk: askSide[0]?.price ?? null,
      });
      setBids(bidSide);
      setAsks(askSide);
      setLive(true);
      setError(null);
      setReady(true);
    } catch (e) {
      setLive(false);
      setReady(true);
      if (isRpcThrottleError(e)) {
        setError(
          "RPC is rate-limiting. Data will refresh when the node recovers."
        );
      } else {
        const msg = e instanceof Error ? e.message : "read failed";
        setError(
          msg.includes("could not decode") || msg.includes("BAD_DATA")
            ? "Contract read failed. Check config address."
            : `Live read failed: ${msg.slice(0, 100)}`
        );
      }
    } finally {
      inflight.current = false;
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await refresh();
    await loadTrades();
  }, [refresh, loadTrades]);

  useEffect(() => {
    if (!contract) return;
    let cancelled = false;

    const boot = async () => {
      if (cancelled) return;
      await refresh();
      if (cancelled) return;
      await loadTrades();
    };
    void boot();

    const iv = setInterval(() => {
      void refresh();
    }, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, [contract, refresh, loadTrades]);

  return {
    ready,
    live,
    error,
    stats,
    bids,
    asks,
    trades,
    refresh,
    refreshAll,
  };
}
