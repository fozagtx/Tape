"use client";

import React from "react";
import { Divider, Link } from "@heroui/react";
import { CHAIN_CONFIG } from "@/lib/config";
import { useWallet } from "./WalletProvider";
import Panel from "./ui/panel";
import CellValue from "./ui/cell-value";

export default function ChainInfo() {
  const { chainId, contractAddress } = useWallet();
  const onChain = chainId === CHAIN_CONFIG.chainId;
  const rpcHost = (() => {
    try {
      return new URL(CHAIN_CONFIG.rpcUrl).hostname;
    } catch {
      return CHAIN_CONFIG.rpcUrl;
    }
  })();

  return (
    <Panel title="Network">
      <div className="flex flex-col">
        <CellValue label="Chain" value="BOT Testnet" />
        <CellValue
          label="Chain ID"
          value={
            <span className="font-mono tabular-nums">
              {CHAIN_CONFIG.chainId}
              {chainId != null && !onChain && (
                <span className="ml-1 text-tiny text-danger">
                  (wallet: {chainId})
                </span>
              )}
            </span>
          }
        />
        <CellValue
          label="Block time"
          value={
            <span className="font-mono tabular-nums">
              {(CHAIN_CONFIG.blockTime / 1000).toFixed(2)}s
            </span>
          }
        />
        <CellValue label="RPC" value={rpcHost} />
      </div>
      <Divider className="my-3 bg-default-100" />
      <Link
        isExternal
        href={`${CHAIN_CONFIG.explorerUrl}/address/${contractAddress}`}
        className="block truncate font-mono text-tiny"
        size="sm"
      >
        {contractAddress}
      </Link>
    </Panel>
  );
}
