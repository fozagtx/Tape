"use client";

import React from "react";
import { HeroUIProvider } from "@heroui/react";
import { WalletProvider } from "./components/WalletProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <WalletProvider>{children}</WalletProvider>
    </HeroUIProvider>
  );
}
