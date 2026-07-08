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
import { CHAIN_CONFIG } from "@/lib/config";

export default function Home() {
  const { contract } = useWallet();

  if (!contract) {
    return (
      <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
        <Header />
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
          <div className="mb-8 max-w-md text-center">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">
              BOT Chain · On-chain CLOB
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-white)] sm:text-3xl">
              Trade limits that settle every block
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
              Every place, match, and cancel is a real transaction. No fake
              depth, no off-chain matching theater.
            </p>
          </div>
          <div className="w-full max-w-md">
            <DeployContract />
          </div>
        </main>
        <footer className="border-t border-[var(--color-border)] py-3 text-center text-[10px] text-[var(--color-dim)]">
          Tape · BOT Chain Testnet (chain {CHAIN_CONFIG.chainId}) ·{" "}
          <a
            href="https://botchain.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-muted)] hover:text-[var(--color-accent)]"
          >
            botchain.ai
          </a>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <Header />
      <main className="mx-auto w-full max-w-[1600px] flex-1 px-2 py-3 sm:px-4 lg:px-6">
        <div className="mb-3">
          <MarketStats />
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[260px_minmax(0,1fr)_300px]">
          <div className="order-2 lg:order-1">
            <OrderBook />
          </div>
          <div className="order-1 flex flex-col gap-3 lg:order-2">
            <PriceChart />
            <RecentTrades />
            <UserOrders />
          </div>
          <div className="order-3 flex flex-col gap-3">
            <TradeForm />
            <ChainInfo />
          </div>
        </div>
      </main>
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-card)]">
        <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-2 px-4 py-3 sm:flex-row lg:px-6">
          <div className="flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full bg-[var(--color-green)] animate-pulse-dot"
              aria-hidden
            />
            <span className="text-[10px] text-[var(--color-dim)]">
              BOT Chain Testnet · {(CHAIN_CONFIG.blockTime / 1000).toFixed(2)}s
              blocks · chain {CHAIN_CONFIG.chainId}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-[var(--color-dim)]">
              Tape — on-chain order book
            </span>
            <a
              href={CHAIN_CONFIG.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-[var(--color-muted)] transition-colors hover:text-[var(--color-accent)]"
            >
              Explorer
            </a>
            <a
              href="https://botchain.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-[var(--color-muted)] transition-colors hover:text-[var(--color-accent)]"
            >
              botchain.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
