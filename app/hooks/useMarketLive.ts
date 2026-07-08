"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Contract } from "ethers";
import type { EventLog } from "ethers";

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
};

const EMPTY_STATS: MarketStats = {
  totalOrders: 0,
  bids: 0,
  asks: 0,
  matches: 0,
  bestBid: null,
  bestAsk: null,
};

function formatSide(prices: bigint[], qtys: bigint[]): BookEntry[] {
  let running = 0;
  return prices.map((p, i) => {
    const price = Number(p) / 1e9;
    const qty = Number(qtys[i]);
    running += price * qty;
    return { price, quantity: qty, total: running };
  });
}

/**
 * Real-time market data: poll + contract event push.
 * Does NOT swallow permanent contract failures as "empty book".
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
  contractRef.current = contract;

  const refresh = useCallback(async () => {
    const c = contractRef.current;
    if (!c) return;

    try {
      // Health + core reads in parallel
      const [statsRaw, bidData, askData] = await Promise.all([
        c.stats(),
        c.getBookSide(true, 20),
        c.getBookSide(false, 20),
      ]);

      let bestBid: number | null = null;
      let bestAsk: number | null = null;
      try {
        const bb = await c.getBestBid();
        const ba = await c.getBestAsk();
        const bp = Number(bb.price ?? bb[0] ?? 0) / 1e9;
        const ap = Number(ba.price ?? ba[0] ?? 0) / 1e9;
        bestBid = bp > 0 ? bp : null;
        bestAsk = ap > 0 ? ap : null;
      } catch {
        /* optional */
      }

      setStats({
        totalOrders: Number(statsRaw[0]),
        bids: Number(statsRaw[1]),
        asks: Number(statsRaw[2]),
        matches: Number(statsRaw[3]),
        bestBid,
        bestAsk,
      });
      setBids(formatSide(bidData[0], bidData[1]));
      setAsks(formatSide(askData[0], askData[1]));
      setLive(true);
      setError(null);
      setReady(true);
    } catch (e) {
      setLive(false);
      setReady(true);
      const msg = e instanceof Error ? e.message : "read failed";
      setError(
        msg.includes("could not decode") || msg.includes("BAD_DATA")
          ? "Contract at config address does not respond as TapeOrderBook. Deploy the real contract and update lib/config.ts."
          : `Live read failed: ${msg.slice(0, 120)}`
      );
    }
  }, []);

  // Load trade history once + keep listening
  const loadTrades = useCallback(async () => {
    const c = contractRef.current;
    if (!c) return;
    try {
      const filter = c.filters.OrderMatched();
      const events = await c.queryFilter(filter, -2000);
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
            ts: Date.now() - (events.length - idx) * 1000,
          };
        })
        .reverse()
        .slice(0, 40);
      setTrades(rows);
    } catch {
      /* history optional if book works */
    }
  }, []);

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

    // Poll backup (events can drop on some public RPCs)
    const iv = setInterval(() => {
      void refresh();
    }, 2000);

    const onBookChange = () => {
      void refresh();
    };

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
            ts: Date.now(),
          },
          ...prev,
        ].slice(0, 40)
      );
      void refresh();
    };

    try {
      contract.on("OrderPlaced", onBookChange);
      contract.on("OrderCancelled", onBookChange);
      contract.on("OrderMatched", onMatch);
      contract.on("OrderFilled", onBookChange);
    } catch {
      /* provider may not support filters */
    }

    return () => {
      cancelled = true;
      clearInterval(iv);
      try {
        contract.off("OrderPlaced", onBookChange);
        contract.off("OrderCancelled", onBookChange);
        contract.off("OrderMatched", onMatch);
        contract.off("OrderFilled", onBookChange);
      } catch {
        /* ignore */
      }
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
  };
}
