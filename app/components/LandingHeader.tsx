"use client";

import React from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Button,
  Link,
  cn,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useWallet } from "./WalletProvider";
import ThemeSwitch from "./ThemeSwitch";

const nav = [
  { label: "How it works", href: "#how" },
  { label: "Features", href: "#features" },
  { label: "Design", href: "#why" },
];

export default function LandingHeader() {
  const router = useRouter();
  const { isConnected, isConnecting, connect, hasWallet, error, clearError } =
    useWallet();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  const enterTrade = async () => {
    clearError();
    if (isConnected) {
      router.push("/trade");
      return;
    }
    setBusy(true);
    try {
      const ok = await connect();
      // connect() flushSyncs isConnected so /trade won't bounce to landing
      if (ok) router.push("/trade");
    } finally {
      setBusy(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-default-100 bg-background/95 backdrop-blur-md">
      <Navbar
        maxWidth="full"
        height="60px"
        isBordered={false}
        isBlurred={false}
        position="static"
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
        classNames={{
          base: "bg-transparent",
          wrapper: "w-full max-w-[var(--tape-max)] px-4 md:px-6 lg:px-8",
          item: "hidden md:flex",
        }}
      >
        <NavbarBrand as={NextLink} href="/" className="min-w-0 gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
            <span className="font-mono text-small font-bold">T</span>
          </div>
          <span className="text-small font-medium text-foreground">Tape</span>
        </NavbarBrand>

        <NavbarContent justify="center" className="hidden gap-6 md:flex">
          {nav.map((item) => (
            <NavbarItem key={item.href}>
              <Link
                href={item.href}
                size="sm"
                className="text-default-500 hover:text-foreground"
              >
                {item.label}
              </Link>
            </NavbarItem>
          ))}
        </NavbarContent>

        <NavbarContent justify="end" className="gap-2">
          <NavbarItem className="flex">
            <ThemeSwitch />
          </NavbarItem>
          <NavbarItem>
            <Button
              radius="full"
              color="primary"
              size="sm"
              className="min-h-9 font-medium"
              isLoading={busy || isConnecting}
              onPress={() => void enterTrade()}
              endContent={
                !(busy || isConnecting) ? (
                  <Icon icon="solar:alt-arrow-right-linear" width={16} />
                ) : undefined
              }
            >
              {isConnected
                ? "Open dashboard"
                : hasWallet === false
                  ? "Install wallet"
                  : "Connect & trade"}
            </Button>
          </NavbarItem>
          <NavbarMenuToggle className="text-default-400 md:hidden" />
        </NavbarContent>

        <NavbarMenu className="gap-2 border-b border-default-100 bg-background pt-4">
          {nav.map((item) => (
            <NavbarMenuItem key={item.href}>
              <Link
                href={item.href}
                size="lg"
                className="w-full text-default-600"
                onPress={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
          <NavbarMenuItem className="flex justify-center py-2">
            <ThemeSwitch />
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Button
              fullWidth
              color="primary"
              radius="full"
              className="mt-2"
              isLoading={busy || isConnecting}
              onPress={() => void enterTrade()}
            >
              {isConnected ? "Open dashboard" : "Connect & trade"}
            </Button>
          </NavbarMenuItem>
        </NavbarMenu>
      </Navbar>

      {error && (
        <div className="border-t border-danger/20 bg-danger/10">
          <div className="mx-auto flex max-w-[var(--tape-max)] items-center justify-between gap-3 px-4 py-2 md:px-6 lg:px-8">
            <p className="min-w-0 text-tiny text-danger">{error}</p>
            <Button
              size="sm"
              variant="light"
              color="danger"
              className="shrink-0"
              onPress={clearError}
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
