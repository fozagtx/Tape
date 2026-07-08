"use client";

import React, { createContext, useContext } from "react";
import { useWallet } from "./WalletProvider";
import { useMarketLive, type MarketLive } from "../hooks/useMarketLive";

const MarketContext = createContext<MarketLive | null>(null);

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const { contract } = useWallet();
  const market = useMarketLive(contract);
  return (
    <MarketContext.Provider value={market}>{children}</MarketContext.Provider>
  );
}

export function useMarket() {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error("useMarket must be used within MarketProvider");
  return ctx;
}
