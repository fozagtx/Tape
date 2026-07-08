"use client";

import React from "react";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/navigation";
import { WalletProvider } from "./components/WalletProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <HeroUIProvider navigate={router.push}>
        <WalletProvider>{children}</WalletProvider>
      </HeroUIProvider>
    </NextThemesProvider>
  );
}
