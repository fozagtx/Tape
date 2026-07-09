"use client";

import React from "react";
import NextLink from "next/link";
import { Button, Card, Chip, Link } from "@heroui/react";
import { Icon } from "@iconify/react";
import LandingHeader from "./components/LandingHeader";
import EnterTradeButton from "./components/EnterTradeButton";
import ActionCard from "./components/ui/action-card";

const FEATURES = [
  {
    icon: "solar:book-linear",
    title: "On-chain order book",
    description:
      "Bids and asks live in the TapeOrderBook contract. Depth is polled from public RPC.",
    color: "primary" as const,
  },
  {
    icon: "solar:transfer-horizontal-linear",
    title: "On-chain matching",
    description:
      "Crossing prices match in the contract and emit OrderMatched. Every fill is a confirmed transaction.",
    color: "warning" as const,
  },
  {
    icon: "solar:chart-2-linear",
    title: "Price from fills",
    description:
      "The chart and recent trades update from OrderMatched events only.",
    color: "default" as const,
  },
  {
    icon: "solar:wallet-linear",
    title: "Wallet trading",
    description:
      "Place limit orders and cancel open ones with your wallet on-chain.",
    color: "danger" as const,
  },
];

const STEPS = [
  {
    n: "01",
    title: "Connect wallet",
    body: "Use Connect in the header. The trading dashboard opens after you approve.",
  },
  {
    n: "02",
    title: "Place a limit",
    body: "Set price (gwei) and quantity. The order rests on the book or matches when prices cross.",
  },
  {
    n: "03",
    title: "See fills",
    body: "Matches appear in Recent trades and update the price chart. Cancel open orders anytime.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative flex min-h-dvh w-full flex-col bg-background">
      <LandingHeader />

      <main className="flex flex-1 flex-col">
        {/* Hero — only primary CTA on the page (plus header) */}
        <section className="tape-shell flex flex-col items-center px-4 pb-16 pt-12 sm:pt-16 md:pb-20 md:pt-20">
          <Chip
            variant="bordered"
            radius="full"
            className="mb-6 h-9 border-default-100 bg-default-50 px-4 text-small text-default-500"
          >
            On-chain limit order book
          </Chip>

          <h1 className="max-w-3xl text-center text-[clamp(2.25rem,8vw,3.75rem)] font-bold leading-[1.15] tracking-tighter text-foreground">
            Limit orders that settle
            <br className="hidden sm:block" /> on every block
          </h1>

          <p className="mt-5 max-w-xl text-center text-small leading-7 text-default-500 sm:text-medium sm:leading-7">
            Tape is a fully on-chain limit order book. Place, match, and cancel
            are separate confirmed transactions.
          </p>

          <div className="mt-8 flex w-full max-w-md flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row sm:items-center">
            <EnterTradeButton
              className="h-11 min-w-[12rem] bg-foreground font-medium text-background"
              size="lg"
            >
              Connect & trade
            </EnterTradeButton>
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
        </section>

        <section className="border-y border-default-100 bg-content1/40">
          <div className="tape-shell py-14 md:py-16">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-tiny font-semibold uppercase tracking-widest text-primary">
                Project goal
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                A complete CLOB that runs on-chain
              </h2>
              <p className="mt-4 text-small leading-relaxed text-default-500 sm:text-medium">
                Placement, matching, and cancellation all happen in the
                contract. Book state and events are the source of truth for
                traders and auditors.
              </p>
            </div>
          </div>
        </section>

        <section id="how" className="tape-shell scroll-mt-20 py-14 md:py-16">
          <div className="mb-8 max-w-xl">
            <p className="text-tiny font-semibold uppercase tracking-widest text-primary">
              How it works
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Three steps
            </h2>
          </div>
          <ol className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
            {STEPS.map((step) => (
              <li key={step.n}>
                <Card
                  className="h-full border border-transparent p-5 dark:border-default-100"
                  shadow="none"
                >
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

        <section
          id="features"
          className="scroll-mt-20 border-t border-default-100 bg-content1/30"
        >
          <div className="tape-shell py-14 md:py-16">
            <div className="mb-8 max-w-xl">
              <p className="text-tiny font-semibold uppercase tracking-widest text-primary">
                Features
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                What ships in the app
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

        <section id="why" className="tape-shell scroll-mt-20 py-14 md:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-tiny font-semibold uppercase tracking-widest text-primary">
              Design
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Built for fast, cheap blocks
            </h2>
            <p className="mt-4 text-small leading-relaxed text-default-500 sm:text-medium">
              Per-order transactions work when block times are short and fees
              are low. Tape targets that environment so the chain can host the
              full order book.
            </p>
            <ul className="mx-auto mt-8 flex max-w-md flex-col gap-3 text-left">
              {[
                "Price-time priority book in Solidity",
                "OrderPlaced, OrderMatched, and OrderCancelled events",
                "Dashboard after wallet connect",
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
          <Link
            isExternal
            href="https://botchain.ai"
            size="sm"
            className="text-default-500"
          >
            botchain.ai
          </Link>
        </div>
      </footer>
    </div>
  );
}
