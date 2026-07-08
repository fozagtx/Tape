"use client";

import React from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Link,
  cn,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useWallet } from "./WalletProvider";
import { CHAIN_CONFIG } from "@/lib/config";
import ThemeSwitch from "./ThemeSwitch";

function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export default function Header() {
  const router = useRouter();
  const {
    address,
    balance,
    chainId,
    isConnected,
    disconnect,
    switchChain,
    error,
    clearError,
  } = useWallet();
  const isCorrectChain = chainId === CHAIN_CONFIG.chainId;

  const handleDisconnect = () => {
    disconnect();
    router.replace("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-default-100 bg-background/95 backdrop-blur-md">
      <Navbar
        maxWidth="full"
        height="60px"
        isBordered={false}
        isBlurred={false}
        position="static"
        classNames={{
          base: "bg-transparent",
          wrapper: "w-full max-w-[var(--tape-max)] px-4 md:px-6 lg:px-8",
        }}
      >
        <NavbarBrand as={NextLink} href="/" className="min-w-0 gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
            <span className="font-mono text-small font-bold">T</span>
          </div>
          <div className="min-w-0">
            <p className="text-small font-medium leading-tight text-foreground">
              Tape
            </p>
            <p className="hidden text-tiny leading-tight text-default-500 sm:block">
              Trade
            </p>
          </div>
        </NavbarBrand>

        <NavbarContent justify="end" className="gap-2">
          <NavbarItem className="hidden sm:flex">
            <ThemeSwitch />
          </NavbarItem>
          <NavbarItem className="hidden md:flex">
            <Link
              as={NextLink}
              href="/"
              className="text-tiny text-default-500"
              size="sm"
            >
              Home
            </Link>
          </NavbarItem>

          {isConnected && !isCorrectChain && (
            <NavbarItem>
              <Button
                color="danger"
                variant="flat"
                size="sm"
                radius="md"
                className="min-h-9"
                onPress={switchChain}
              >
                Switch network
              </Button>
            </NavbarItem>
          )}

          {isConnected && (
            <>
              <NavbarItem className="hidden sm:flex">
                <Chip
                  variant="flat"
                  size="sm"
                  classNames={{ content: "font-mono tabular-nums" }}
                >
                  {Number(balance).toFixed(4)} BOT
                </Chip>
              </NavbarItem>

              <NavbarItem>
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <Button
                      variant="flat"
                      size="sm"
                      radius="md"
                      className="min-h-9"
                      endContent={
                        <Icon
                          icon="solar:alt-arrow-down-linear"
                          width={14}
                        />
                      }
                      startContent={
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            isCorrectChain ? "bg-success" : "bg-danger"
                          )}
                        />
                      }
                    >
                      <span className="font-mono text-tiny">
                        {address ? shortAddr(address) : "-"}
                      </span>
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Wallet menu">
                    <DropdownItem
                      key="addr"
                      isReadOnly
                      className="opacity-100"
                      textValue="address"
                    >
                      <p className="text-tiny text-default-500">Connected</p>
                      <p className="max-w-[200px] truncate font-mono text-tiny">
                        {address}
                      </p>
                    </DropdownItem>
                    <DropdownItem
                      key="disconnect"
                      className="text-danger"
                      color="danger"
                      startContent={
                        <Icon icon="solar:logout-2-linear" width={16} />
                      }
                      onPress={handleDisconnect}
                    >
                      Disconnect
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </NavbarItem>
            </>
          )}

          <NavbarItem className="flex sm:hidden">
            <ThemeSwitch />
          </NavbarItem>
        </NavbarContent>
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
