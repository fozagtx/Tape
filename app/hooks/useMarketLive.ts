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
};

const EMPTY_STATS: MarketStats = {
  totalOrders: 0,
  bids: 0,
  asks: 0,
  matches: 0,
  bestBid: null,
  bestAsk: null,
};

/** Public BOT RPC throttles if we poll too hard */
const POLL_MS = 6000;

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
 * Live market data with light RPC usage.
 * Poll only (no eth_getLogs subscriptions) so public endpoints stay healthy.
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
  const tradesLoaded = useRef(false);
  contractRef.current = contract;

  const refresh = useCallback(async () => {
    const c = contractRef.current;
    if (!c || inflight.current) return;
    inflight.current = true;

    try {
      // 3 calls only (batched by provider). Best bid/ask from book sides.
      const [statsRaw, bidData, askData] = await Promise.all([
        c.stats(),
        c.getBookSide(true, 15),
        c.getBookSide(false, 15),
      ]);

      const bidSide = formatSide(bidData[0], bidData[1]);
      const askSide = formatSide(askData[0], askData[1]);

      setStats({
        totalOrders: Number(statsRaw[0]),
        bids: Number(statsRaw[1]),
        asks: Number(statsRaw[2]),
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
          "RPC is rate-limiting requests. Pausing refresh. Try again in a minute."
        );
      } else {
        const msg = e instanceof Error ? e.message : "read failed";
        setError(
          msg.includes("could not decode") || msg.includes("BAD_DATA")
            ? "Contract does not respond as TapeOrderBook. Check lib/config.ts address."
            : `Live read failed: ${msg.slice(0, 100)}`
        );
      }
    } finally {
      inflight.current = false;
    }
  }, []);

  const loadTrades = useCallback(async () => {
    const c = contractRef.current;
    if (!c || tradesLoaded.current) return;
    try {
      // Small lookback only (public RPC hates large eth_getLogs)
      const filter = c.filters.OrderMatched();
      const events = await c.queryFilter(filter, -200);
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
        .slice(0, 30);
      setTrades(rows);
      tradesLoaded.current = true;
    } catch {
      /* optional history */
    }
  }, []);

  useEffect(() => {
    if (!contract) return;
    let cancelled = false;
    tradesLoaded.current = false;

    const boot = async () => {
      if (cancelled) return;
      await refresh();
      if (cancelled) return;
      await loadTrades();
    };
    void boot();

    // Slow poll + skip overlapping refreshes (avoids -32002 on public RPC)
    const iv = setInterval(() => {
      void refresh();
    }, POLL_MS);

    // No contract.on() subscriptions: ethers polls eth_getLogs aggressively
    // and trips public BOT RPC rate limits.

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
  };
}
