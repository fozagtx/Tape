"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Link, Spinner } from "@heroui/react";
import Header from "../components/Header";
import OrderBook from "../components/OrderBook";
import TradeForm from "../components/TradeForm";
import MarketStats from "../components/MarketStats";
import RecentTrades from "../components/RecentTrades";
import UserOrders from "../components/UserOrders";
import PriceChart from "../components/PriceChart";
import { MarketProvider } from "../components/MarketProvider";
import { useWallet } from "../components/WalletProvider";

/**
 * Trading dashboard - only after wallet connect.
 * Unauthenticated users are sent back to the landing page (/).
 */
export default function TradePage() {
  const router = useRouter();
  const { isConnected } = useWallet();

  useEffect(() => {
    if (!isConnected) {
      router.replace("/");
    }
  }, [isConnected, router]);

  if (!isConnected) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background">
        <Spinner color="primary" size="lg" />
        <p className="text-small text-default-500">
          Connect a wallet to open the book…
        </p>
        <Link href="/" size="sm" className="text-primary">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <MarketProvider>
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

              <div className="order-2 flex flex-col gap-4 lg:order-3 lg:col-span-3">
                <TradeForm />
              </div>
            </div>
          </div>
        </main>

        <footer className="mt-auto border-t border-default-100 bg-content1 pb-[env(safe-area-inset-bottom)]">
          <div className="tape-shell flex flex-col items-center justify-between gap-3 py-4 sm:flex-row">
            <span className="text-tiny text-default-400">
              Tape · on-chain order book
            </span>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              <Link href="/" className="text-tiny text-default-500" size="sm">
                Home
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
    </MarketProvider>
  );
}
