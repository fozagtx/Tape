"use client";

import React from "react";
import NextLink from "next/link";
import { Button, Card, Chip, Divider, Link } from "@heroui/react";
import { Icon } from "@iconify/react";
import LandingHeader from "./components/LandingHeader";
import ActionCard from "./components/ui/action-card";
import { CHAIN_CONFIG } from "@/lib/config";

const FEATURES = [
  {
    icon: "solar:book-linear",
    title: "Live on-chain book",
    description:
      "Bids and asks sit in the TapeOrderBook contract. Depth is read from chain every few seconds — not from a private server.",
    color: "primary" as const,
  },
  {
    icon: "solar:transfer-horizontal-linear",
    title: "Match engine on-chain",
    description:
      "When prices cross, the contract matches and emits OrderMatched. Every fill is a confirmed transaction you can audit.",
    color: "warning" as const,
  },
  {
    icon: "solar:chart-2-linear",
    title: "Honest price tape",
    description:
      "The chart and recent trades only plot real fills. No mock candles, no synthetic volume, no placeholder CTAs.",
    color: "default" as const,
  },
  {
    icon: "solar:wallet-linear",
    title: "Wallet-native trading",
    description:
      "Connect MetaMask (or any EVM wallet), switch to BOT Testnet, place limit buys and sells, cancel from My orders.",
    color: "danger" as const,
  },
];

const STEPS = [
  {
    n: "01",
    title: "Connect on BOT Chain",
    body: "Use the header wallet button. Tape targets BOT Chain Testnet (0.75s blocks) so each order is cheap enough to live fully on-chain.",
  },
  {
    n: "02",
    title: "Place a limit order",
    body: "Set price (gwei) and quantity. placeOrder is a real tx — it either rests on the book or matches immediately if prices cross.",
  },
  {
    n: "03",
    title: "Watch the tape print",
    body: "Matches show in Recent trades and feed the price chart. Cancel open orders any time; cancelOrder is also on-chain.",
  },
];

/**
 * Landing — project goal & product story (design-promax hero + action cards)
 * Trade terminal lives at /trade
 */
export default function LandingPage() {
  return (
    <div className="relative flex min-h-dvh w-full flex-col overflow-x-hidden bg-background">
      <LandingHeader />

      <main className="flex flex-1 flex-col">
        {/* Hero — design-promax centered hero pattern */}
        <section className="tape-shell flex flex-col items-center px-4 pb-16 pt-12 sm:pt-16 md:pb-20 md:pt-20">
          <Chip
            variant="bordered"
            radius="full"
            className="mb-6 h-9 border-default-100 bg-default-50 px-4 text-small text-default-500"
            endContent={
              <Icon
                icon="solar:arrow-right-linear"
                width={18}
                className="text-default-400"
                aria-hidden
              />
            }
          >
            Built for BOT Chain · fully on-chain CLOB
          </Chip>

          <h1 className="max-w-3xl text-center text-[clamp(2.25rem,8vw,3.75rem)] font-bold leading-[1.15] tracking-tighter text-foreground">
            Limit orders that settle
            <br className="hidden sm:block" /> every block — not off-chain.
          </h1>

          <p className="mt-5 max-w-xl text-center text-small leading-7 text-default-500 sm:text-medium sm:leading-7">
            <strong className="font-medium text-default-700">Tape</strong> is an
            on-chain limit order book. Every place, match, and cancel is its own
            confirmed transaction on BOT Chain — transparent depth, real fills,
            no matching theater.
          </p>

          <div className="mt-8 flex w-full max-w-md flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row sm:items-center">
            <Button
              as={NextLink}
              href="/trade"
              radius="full"
              size="lg"
              className="h-11 min-w-[10rem] bg-foreground font-medium text-background"
              endContent={
                <Icon icon="solar:alt-arrow-right-linear" width={18} />
              }
            >
              Start trading
            </Button>
            <Button
              as={NextLink}
              href="#how"
              radius="full"
              size="lg"
              variant="bordered"
              className="h-11 min-w-[10rem] border-default-100 font-medium"
            >
              How it works
            </Button>
          </div>

          {/* Product preview strip */}
          <Card className="mt-14 w-full max-w-5xl border border-default-100 bg-content1/60 shadow-none">
            <div className="grid gap-0 sm:grid-cols-3">
              {[
                {
                  label: "Block time",
                  value: `${(CHAIN_CONFIG.blockTime / 1000).toFixed(2)}s`,
                  hint: "BOT Testnet",
                },
                {
                  label: "Matching",
                  value: "On-chain",
                  hint: "TapeOrderBook.sol",
                },
                {
                  label: "Chain ID",
                  value: String(CHAIN_CONFIG.chainId),
                  hint: "Testnet",
                },
              ].map((item, i) => (
                <div
                  key={item.label}
                  className={`flex flex-col gap-1 p-5 ${
                    i > 0 ? "border-t border-default-100 sm:border-l sm:border-t-0" : ""
                  }`}
                >
                  <span className="text-tiny font-medium uppercase tracking-wide text-default-400">
                    {item.label}
                  </span>
                  <span className="font-mono text-xl font-semibold text-default-700">
                    {item.value}
                  </span>
                  <span className="text-tiny text-default-400">{item.hint}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Goal */}
        <section className="border-y border-default-100 bg-content1/40">
          <div className="tape-shell py-14 md:py-16">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-tiny font-semibold uppercase tracking-widest text-primary">
                Project goal
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Prove that a full CLOB can live entirely on a fast L1
              </h2>
              <p className="mt-4 text-small leading-relaxed text-default-500 sm:text-medium">
                Centralized books hide the match engine. Tape puts placement,
                matching, and cancellation on BOT Chain so traders and auditors
                see the same truth — the contract state and events. Sub-second
                blocks make per-order transactions practical.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="tape-shell scroll-mt-20 py-14 md:py-16">
          <div className="mb-8 max-w-xl">
            <p className="text-tiny font-semibold uppercase tracking-widest text-primary">
              How it works
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Three steps from wallet to fill
            </h2>
          </div>
          <ol className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
            {STEPS.map((step) => (
              <li key={step.n}>
                <Card className="h-full border border-transparent p-5 dark:border-default-100" shadow="none">
                  <span className="font-mono text-tiny font-semibold text-primary">
                    {step.n}
                  </span>
                  <h3 className="mt-3 text-medium font-semibold text-default-700">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-small leading-relaxed text-default-400">
                    {step.body}
                  </p>
                </Card>
              </li>
            ))}
          </ol>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-20 border-t border-default-100 bg-content1/30">
          <div className="tape-shell py-14 md:py-16">
            <div className="mb-8 max-w-xl">
              <p className="text-tiny font-semibold uppercase tracking-widest text-primary">
                What you get
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Everything a book needs — nothing fake
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5">
              {FEATURES.map((f) => (
                <ActionCard
                  key={f.title}
                  icon={f.icon}
                  title={f.title}
                  description={f.description}
                  color={f.color}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Why BOT */}
        <section id="why" className="tape-shell scroll-mt-20 py-14 md:py-16">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <p className="text-tiny font-semibold uppercase tracking-widest text-primary">
                Why BOT Chain
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Fast blocks make on-chain orders viable
              </h2>
              <p className="mt-4 text-small leading-relaxed text-default-500 sm:text-medium">
                On slow or expensive chains, posting every limit as a
                transaction is impractical. BOT Chain’s ~0.75s blocks and low
                fees let Tape treat the chain as the exchange — not a settlement
                afterthought.
              </p>
              <ul className="mt-6 flex flex-col gap-3">
                {[
                  "Price-time priority book in Solidity",
                  "Events for OrderPlaced, OrderMatched, OrderCancelled",
                  "Read path over public RPC; writes via your wallet",
                ].map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-2 text-small text-default-600"
                  >
                    <Icon
                      icon="solar:check-circle-linear"
                      className="mt-0.5 shrink-0 text-success"
                      width={18}
                      aria-hidden
                    />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            <Card
              className="border border-transparent p-6 dark:border-default-100"
              shadow="none"
            >
              <p className="text-tiny font-medium uppercase tracking-wide text-default-400">
                Live contract
              </p>
              <p className="mt-2 break-all font-mono text-small text-default-700">
                {CHAIN_CONFIG.contractAddress}
              </p>
              <Divider className="my-4 bg-default-100" />
              <div className="flex flex-col gap-2 text-small text-default-500">
                <div className="flex justify-between gap-3">
                  <span>Network</span>
                  <span className="font-medium text-default-700">
                    BOT Testnet
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>RPC</span>
                  <span className="truncate font-mono text-tiny text-default-700">
                    {new URL(CHAIN_CONFIG.rpcUrl).hostname}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>Explorer</span>
                  <Link
                    isExternal
                    href={`${CHAIN_CONFIG.explorerUrl}/address/${CHAIN_CONFIG.contractAddress}`}
                    size="sm"
                    className="text-primary"
                  >
                    View on scan
                  </Link>
                </div>
              </div>
              <Button
                as={NextLink}
                href="/trade"
                fullWidth
                radius="full"
                color="primary"
                className="mt-6 min-h-11 font-medium"
                endContent={
                  <Icon icon="solar:alt-arrow-right-linear" width={18} />
                }
              >
                Open the order book
              </Button>
            </Card>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-default-100 bg-content1/50">
          <div className="tape-shell flex flex-col items-center py-14 text-center md:py-16">
            <h2 className="max-w-lg text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Ready to print a fill?
            </h2>
            <p className="mt-3 max-w-md text-small text-default-500">
              Open the terminal, connect a wallet on BOT Testnet, and place your
              first limit order on Tape.
            </p>
            <Button
              as={NextLink}
              href="/trade"
              radius="full"
              size="lg"
              className="mt-8 h-11 min-w-[12rem] bg-foreground font-medium text-background"
              endContent={
                <Icon icon="solar:alt-arrow-right-linear" width={18} />
              }
            >
              Go to trade
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-default-100 pb-[env(safe-area-inset-bottom)]">
        <div className="tape-shell flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background">
              <span className="font-mono text-tiny font-bold">T</span>
            </div>
            <span className="text-small text-default-500">
              Tape · on-chain order book
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Link href="/trade" size="sm" className="text-default-500">
              Trade
            </Link>
            <Link
              isExternal
              href={CHAIN_CONFIG.explorerUrl}
              size="sm"
              className="text-default-500"
            >
              Explorer
            </Link>
            <Link
              isExternal
              href="https://botchain.ai"
              size="sm"
              className="text-default-500"
            >
              botchain.ai
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
