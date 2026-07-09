"use client";

import React from "react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useWallet } from "./WalletProvider";

type Props = {
  children?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "default";
  variant?:
    | "solid"
    | "flat"
    | "bordered"
    | "light"
    | "faded"
    | "shadow"
    | "ghost";
  fullWidth?: boolean;
  radius?: "none" | "sm" | "md" | "lg" | "full";
};

/** Connect wallet (if needed) then open /trade dashboard */
export default function EnterTradeButton({
  children = "Connect & trade",
  className,
  size = "lg",
  color = "default",
  variant = "solid",
  fullWidth,
  radius = "full",
}: Props) {
  const router = useRouter();
  const { isConnected, isConnecting, connect, error } = useWallet();
  const [busy, setBusy] = React.useState(false);

  const onPress = async () => {
    if (isConnected) {
      router.push("/trade");
      return;
    }
    setBusy(true);
    try {
      const ok = await connect();
      if (ok) {
        // flushSync already applied isConnected — navigate next frame
        router.push("/trade");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        radius={radius}
        size={size}
        color={color}
        variant={variant}
        fullWidth={fullWidth}
        className={className}
        isLoading={busy || isConnecting}
        onPress={() => void onPress()}
        endContent={
          !(busy || isConnecting) ? (
            <Icon icon="solar:alt-arrow-right-linear" width={18} />
          ) : undefined
        }
      >
        {isConnected ? "Open dashboard" : children}
      </Button>
      {error && (
        <p className="max-w-sm text-center text-tiny text-danger">{error}</p>
      )}
    </div>
  );
}
