"use client";

import React from "react";
import { Link } from "@heroui/react";
import Header from "./components/Header";
import OrderBook from "./components/OrderBook";
import TradeForm from "./components/TradeForm";
import MarketStats from "./components/MarketStats";
import RecentTrades from "./components/RecentTrades";
import UserOrders from "./components/UserOrders";
import PriceChart from "./components/PriceChart";
import ChainInfo from "./components/ChainInfo";
import { CHAIN_CONFIG } from "@/lib/config";

/**
 * Layout measures (4px grid + design-promax):
 * - shell gutters: 16 / 24 / 32 via .tape-shell
 * - section gap: gap-4 (16) · KPI uses gap-4 / lg:gap-5
 * - panel pad: p-4 · headers: px-4 py-3
 * - one mount per panel (no hidden duplicates)
 *
 * Breakpoints:
 * - base: chart → trade → book → trades/orders → network
 * - sm: trades | orders
 * - lg: book 3 | center 6 | trade 3
 */
export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header />

      <main className="tape-shell flex-1 py-4 md:py-5 lg:py-6">
        <div className="flex flex-col gap-4 lg:gap-5">
          <MarketStats />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start lg:gap-5">
            <div className="order-3 lg:order-1 lg:col-span-3">
              <OrderBook />
            </div>

            <div className="order-1 flex flex-col gap-4 lg:order-2 lg:col-span-6 lg:gap-5">
              <PriceChart />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5">
                <RecentTrades />
                <UserOrders />
              </div>
            </div>

            <div className="order-2 flex flex-col gap-4 lg:order-3 lg:col-span-3 lg:gap-5">
              <TradeForm />
              <ChainInfo />
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-auto border-t border-default-100 bg-content1 pb-[env(safe-area-inset-bottom)]">
        <div className="tape-shell flex flex-col items-center justify-between gap-3 py-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-success"
              aria-hidden
            />
            <span className="text-center text-tiny text-default-400 sm:text-left">
              BOT Chain Testnet · {(CHAIN_CONFIG.blockTime / 1000).toFixed(2)}s
              blocks · chain {CHAIN_CONFIG.chainId}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <span className="text-tiny text-default-400">
              Tape — on-chain order book
            </span>
            <Link
              isExternal
              href={`${CHAIN_CONFIG.explorerUrl}/address/${CHAIN_CONFIG.contractAddress}`}
              className="text-tiny text-default-500"
              size="sm"
            >
              Contract
            </Link>
            <Link
              isExternal
              href={CHAIN_CONFIG.explorerUrl}
              className="text-tiny text-default-500"
              size="sm"
            >
              Explorer
            </Link>
            <Link
              isExternal
              href="https://botchain.ai"
              className="text-tiny text-default-500"
              size="sm"
            >
              botchain.ai
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
