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
import { useWallet } from "./WalletProvider";
import { CHAIN_CONFIG } from "@/lib/config";

function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

/** design-promax navbars pattern — height 56–60, shell gutters, solar icons */
export default function Header() {
  const {
    address,
    balance,
    chainId,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    switchChain,
    contractAddress,
    error,
    clearError,
    hasWallet,
  } = useWallet();
  const isCorrectChain = chainId === CHAIN_CONFIG.chainId;

  return (
    <>
      <Navbar
        maxWidth="full"
        height="60px"
        isBordered
        classNames={{
          base: cn("border-default-100 bg-background/90 backdrop-blur-md"),
          wrapper: "w-full max-w-[var(--tape-max)] px-4 md:px-6 lg:px-8",
        }}
      >
        <NavbarBrand
          as={NextLink}
          href="/"
          className="min-w-0 gap-3"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
            <span className="font-mono text-small font-bold">T</span>
          </div>
          <div className="min-w-0">
            <p className="text-small font-medium leading-tight text-foreground">
              Tape
            </p>
            <p className="hidden text-tiny leading-tight text-default-500 sm:block">
              On-chain order book
            </p>
          </div>
          <Chip
            size="sm"
            variant="flat"
            color={isConnected && isCorrectChain ? "success" : "default"}
            className="hidden sm:flex"
            startContent={
              <span
                className={cn(
                  "mx-0.5 h-1.5 w-1.5 rounded-full",
                  isConnected && isCorrectChain
                    ? "bg-success"
                    : "bg-default-400"
                )}
              />
            }
          >
            BOT Testnet
          </Chip>
        </NavbarBrand>

        <NavbarContent justify="end" className="gap-2">
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
          <NavbarItem className="hidden lg:flex">
            <Link
              isExternal
              href={`${CHAIN_CONFIG.explorerUrl}/address/${contractAddress}`}
              className="font-mono text-tiny text-default-500"
              size="sm"
            >
              {shortAddr(contractAddress)}
            </Link>
          </NavbarItem>

          {!isConnected ? (
            <NavbarItem>
              <Button
                color="primary"
                radius="full"
                size="sm"
                className="min-h-9 font-medium"
                isLoading={isConnecting}
                onPress={connect}
                endContent={
                  !isConnecting ? (
                    <Icon icon="solar:alt-arrow-right-linear" width={16} />
                  ) : undefined
                }
                startContent={
                  !isConnecting ? (
                    <Icon icon="solar:wallet-linear" width={16} />
                  ) : undefined
                }
              >
                <span className="sm:hidden">
                  {hasWallet === false ? "Install" : "Connect"}
                </span>
                <span className="hidden sm:inline">
                  {hasWallet === false ? "Install wallet" : "Connect wallet"}
                </span>
              </Button>
            </NavbarItem>
          ) : (
            <>
              {!isCorrectChain && (
                <NavbarItem>
                  <Button
                    color="danger"
                    variant="flat"
                    size="sm"
                    radius="md"
                    className="min-h-9"
                    onPress={switchChain}
                  >
                    <span className="hidden sm:inline">Switch to BOT</span>
                    <span className="sm:hidden">Switch</span>
                  </Button>
                </NavbarItem>
              )}

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
                        {address ? shortAddr(address) : "—"}
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
                      <p className="mt-1 font-mono text-tiny text-default-400 sm:hidden">
                        {Number(balance).toFixed(4)} BOT
                      </p>
                    </DropdownItem>
                    <DropdownItem
                      key="explorer"
                      href={`${CHAIN_CONFIG.explorerUrl}/address/${contractAddress}`}
                      target="_blank"
                      startContent={
                        <Icon icon="solar:link-round-linear" width={16} />
                      }
                    >
                      View contract
                    </DropdownItem>
                    <DropdownItem
                      key="disconnect"
                      className="text-danger"
                      color="danger"
                      startContent={
                        <Icon icon="solar:logout-2-linear" width={16} />
                      }
                      onPress={disconnect}
                    >
                      Disconnect
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </NavbarItem>
            </>
          )}
        </NavbarContent>
      </Navbar>

      {error && (
        <div className="border-b border-danger/20 bg-danger/10">
          <div className="tape-shell flex items-center justify-between gap-3 py-2">
            <p className="min-w-0 text-tiny text-danger sm:text-small">
              {error}
            </p>
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
    </>
  );
}
