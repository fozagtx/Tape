"use client";

import Header from "./components/Header";
import OrderBook from "./components/OrderBook";
import TradeForm from "./components/TradeForm";
import MarketStats from "./components/MarketStats";
import RecentTrades from "./components/RecentTrades";
import UserOrders from "./components/UserOrders";
import PriceChart from "./components/PriceChart";
import ChainInfo from "./components/ChainInfo";
import DeployContract from "./components/DeployContract";
import { useWallet } from "./components/WalletProvider";

export default function Home() {
  const { contract } = useWallet();

  if (!contract) {
    return (
      <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4">
          <div className="w-full max-w-md">
            <DeployContract />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <Header />
      <main className="mx-auto w-full max-w-[1920px] flex-1 px-2 py-4 sm:px-4 lg:px-6">
        <div className="mb-4"><MarketStats /></div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr_320px]">
          <div className="order-2 lg:order-1"><OrderBook /></div>
          <div className="flex flex-col gap-4 order-1 lg:order-2">
            <PriceChart />
            <RecentTrades />
            <UserOrders />
          </div>
          <div className="flex flex-col gap-4 order-3">
            <TradeForm />
            <ChainInfo />
          </div>
        </div>
      </main>
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-card)]">
        <div className="mx-auto flex max-w-[1920px] flex-col items-center justify-between gap-2 px-4 py-3 sm:flex-row lg:px-6">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-green)] animate-pulse" />
            <span className="text-[10px] text-[var(--color-dim)]">BOT Chain Mainnet • 0.75s blocks • SPoA Consensus</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-[var(--color-dim)]">Tape v0.1.0 — On-Chain Order Book</span>
            <a href="https://botchain.ai" target="_blank" rel="noopener noreferrer" className="text-[10px] text-[var(--color-accent)] hover:underline">botchain.ai</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

