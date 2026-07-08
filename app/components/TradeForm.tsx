"use client";

import React, { useState } from "react";
import { Button, ButtonGroup, Input, Chip, cn } from "@heroui/react";
import { Icon } from "@iconify/react";
import { ethers } from "ethers";
import { useWallet } from "./WalletProvider";
import { CHAIN_CONFIG } from "@/lib/config";
import Panel from "./ui/panel";
import CellValue from "./ui/cell-value";
import CellWrapper from "./ui/cell-wrapper";

type Side = "buy" | "sell";

const QTY_PRESETS = [1, 5, 10, 25, 50, 100];

export default function TradeForm() {
  const { isConnected, contract, chainId } = useWallet();
  const [side, setSide] = useState<Side>("buy");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const priceNum = parseFloat(price);
  const qtyNum = parseFloat(quantity);
  const valid =
    Number.isFinite(priceNum) &&
    priceNum > 0 &&
    Number.isFinite(qtyNum) &&
    qtyNum > 0 &&
    Number.isInteger(qtyNum);
  const total = valid ? (priceNum * qtyNum).toFixed(4) : "-";

  const onCorrectChain = chainId === CHAIN_CONFIG.chainId;
  const canSubmit = isConnected && onCorrectChain && valid && !isSubmitting;

  const handleSubmit = async () => {
    if (!isConnected) {
      setError("Connect your wallet to place an order.");
      return;
    }
    if (!onCorrectChain) {
      setError("Switch to BOT Chain Testnet first.");
      return;
    }
    if (!valid) {
      setError(
        Number.isFinite(qtyNum) && !Number.isInteger(qtyNum)
          ? "Quantity must be a whole number."
          : "Enter a price above 0 and a whole-number quantity."
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setTxHash(null);

    try {
      const priceGwei = ethers.parseUnits(price, "gwei");
      const qty = BigInt(Math.floor(qtyNum));
      const tx = await contract.placeOrder(side === "buy", priceGwei, qty);
      const receipt = await tx.wait();
      setTxHash(receipt.hash);
      setQuantity("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Transaction failed";
      if (msg.includes("user rejected") || msg.includes("ACTION_REJECTED")) {
        setError("You rejected the transaction.");
      } else {
        setError(msg.length > 180 ? msg.slice(0, 180) + "…" : msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Panel
      flush
      title="Place order"
      endContent={
        <Chip size="sm" variant="flat">
          Limit
        </Chip>
      }
    >
      {/* body: p-4, stack gap-4 - uniform 16px rhythm */}
      <div className="flex flex-col gap-4 p-4">
        <ButtonGroup fullWidth size="md" radius="md" variant="flat">
          <Button
            className={cn("min-h-10", {
              "bg-success/20 text-success": side === "buy",
            })}
            onPress={() => setSide("buy")}
          >
            Buy
          </Button>
          <Button
            className={cn("min-h-10", {
              "bg-danger/20 text-danger": side === "sell",
            })}
            onPress={() => setSide("sell")}
          >
            Sell
          </Button>
        </ButtonGroup>

        <Input
          type="number"
          label="Price"
          labelPlacement="outside"
          placeholder="0.00"
          value={price}
          onValueChange={setPrice}
          endContent={<span className="text-tiny text-default-400">gwei</span>}
          size="md"
          radius="md"
          variant="bordered"
          classNames={{
            input: "font-mono tabular-nums",
            label: "text-small text-default-500",
          }}
          min={0}
          step={0.01}
        />

        <div className="flex flex-col gap-3">
          <Input
            type="number"
            label="Quantity"
            labelPlacement="outside"
            placeholder="0"
            value={quantity}
            onValueChange={setQuantity}
            endContent={
              <span className="text-tiny text-default-400">units</span>
            }
            size="md"
            radius="md"
            variant="bordered"
            classNames={{
              input: "font-mono tabular-nums",
              label: "text-small text-default-500",
            }}
            min={1}
            step={1}
          />
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {QTY_PRESETS.map((a) => (
              <Button
                key={a}
                size="sm"
                variant="flat"
                radius="sm"
                className="min-h-9 min-w-0 px-0 text-tiny"
                onPress={() => setQuantity(String(a))}
              >
                {a}
              </Button>
            ))}
          </div>
        </div>

        <CellWrapper className="py-1">
          <CellValue
            className="w-full py-0"
            label="Notional"
            value={`${total} gwei·units`}
          />
        </CellWrapper>

        <p className="text-tiny leading-relaxed text-default-400">
          Orders settle on-chain (~0.75s blocks). Gas is paid in BOT. Confirm
          the fee in your wallet before signing.
        </p>

        <Button
          fullWidth
          radius="md"
          size="lg"
          className="min-h-11"
          isLoading={isSubmitting}
          isDisabled={!canSubmit}
          color={side === "buy" ? "success" : "danger"}
          onPress={handleSubmit}
          startContent={
            !isSubmitting ? (
              <Icon
                aria-hidden
                icon={
                  side === "buy"
                    ? "solar:arrow-up-linear"
                    : "solar:arrow-down-linear"
                }
                width={16}
              />
            ) : undefined
          }
        >
          {isSubmitting
            ? "Confirm in wallet…"
            : !isConnected
              ? "Connect wallet to trade"
              : !onCorrectChain
                ? "Wrong network"
                : `${side === "buy" ? "Buy" : "Sell"} limit`}
        </Button>

        {txHash && (
          <div className="rounded-medium border border-success/25 bg-success/10 px-4 py-3 text-tiny text-success">
            Order submitted.{" "}
            <a
              href={`${CHAIN_CONFIG.explorerUrl}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline-offset-2 hover:underline"
            >
              View on explorer
            </a>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-medium border border-danger/25 bg-danger/10 px-4 py-3 text-tiny leading-relaxed text-danger"
          >
            {error}
          </div>
        )}
      </div>
    </Panel>
  );
}
