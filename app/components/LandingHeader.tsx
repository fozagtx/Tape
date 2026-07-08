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

const nav = [
  { label: "How it works", href: "#how" },
  { label: "Features", href: "#features" },
  { label: "Why BOT", href: "#why" },
];

/** design-promax basic-navbar adapted for Tape landing */
export default function LandingHeader() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <Navbar
      maxWidth="full"
      height="60px"
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      classNames={{
        base: cn("border-default-100 bg-background/80 backdrop-blur-md", {
          "bg-default-100/80": isMenuOpen,
        }),
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
        <NavbarItem className="hidden sm:flex">
          <Button
            as={NextLink}
            href="/trade"
            radius="full"
            variant="flat"
            size="sm"
            className="min-h-9 text-default-600"
          >
            Open book
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button
            as={NextLink}
            href="/trade"
            radius="full"
            color="primary"
            size="sm"
            className="min-h-9 font-medium"
            endContent={<Icon icon="solar:alt-arrow-right-linear" width={16} />}
          >
            Start trading
          </Button>
        </NavbarItem>
        <NavbarMenuToggle className="text-default-400 md:hidden" />
      </NavbarContent>

      <NavbarMenu className="top-[calc(var(--navbar-height)_-_1px)] gap-2 bg-background/95 pt-4 backdrop-blur-md">
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
        <NavbarMenuItem>
          <Button
            as={NextLink}
            href="/trade"
            fullWidth
            color="primary"
            radius="full"
            className="mt-2"
          >
            Start trading
          </Button>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
}
