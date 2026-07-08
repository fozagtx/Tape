"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import { CHAIN_CONFIG } from "@/lib/config";
import { TAPE_ABI } from "@/lib/abi";

interface WalletState {
  address: string | null;
  balance: string;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  contract: ethers.Contract | null;
  contractAddress: string | null;
  error: string | null;
}

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchChain: () => Promise<void>;
  setContract: (address: string) => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    balance: "0",
    chainId: null,
    isConnected: false,
    isConnecting: false,
    provider: null,
    signer: null,
    contract: null,
    contractAddress: null,
    error: null,
  });

  const connect = useCallback(async () => {
    if (typeof window === "undefined" || !(window as unknown as Record<string, unknown>).ethereum) {
      setState((s) => ({ ...s, error: "No wallet detected. Install MetaMask." }));
      return;
    }

    setState((s) => ({ ...s, isConnecting: true, error: null }));

    try {
      const ethereum = (window as unknown as { ethereum: ethers.Eip1193Provider }).ethereum;
      const provider = new ethers.BrowserProvider(ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const balance = await provider.getBalance(accounts[0]);
      const chainId = Number(network.chainId);

      setState({
        address: accounts[0],
        balance: ethers.formatEther(balance),
        chainId,
        isConnected: true,
        isConnecting: false,
        provider,
        signer,
        contract: null,
        contractAddress: null,
        error: null,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to connect wallet";
      setState((s) => ({ ...s, isConnecting: false, error: msg }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      address: null,
      balance: "0",
      chainId: null,
      isConnected: false,
      isConnecting: false,
      provider: null,
      signer: null,
      contract: null,
      contractAddress: null,
      error: null,
    });
  }, []);

  const switchChain = useCallback(async () => {
    if (typeof window === "undefined" || !(window as unknown as Record<string, unknown>).ethereum) return;
    try {
      const ethereum = (window as unknown as { ethereum: ethers.Eip1193Provider }).ethereum;
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: "0x407",
          chainName: "BOT Chain",
          rpcUrls: ["https://rpc.botchain.ai"],
          blockExplorerUrls: ["https://explorer.botchain.ai"],
          nativeCurrency: { name: "BOT", symbol: "BOT", decimals: 18 },
        }],
      });
      await connect();
    } catch {
      setState((s) => ({ ...s, error: "Failed to switch chain" }));
    }
  }, [connect]);

  const setContract = useCallback((address: string) => {
    if (!state.signer) return;
    const contract = new ethers.Contract(address, TAPE_ABI, state.signer);
    setState((s) => ({ ...s, contract, contractAddress: address }));
  }, [state.signer]);

  useEffect(() => {
    if (typeof window === "undefined" || !(window as unknown as Record<string, unknown>).ethereum) return;
    const ethereum = (window as unknown as { ethereum: ethers.Eip1193Provider & { on?: (event: string, cb: () => void) => void; removeListener?: (event: string, cb: () => void) => void } }).ethereum;

    const handleAccountsChanged = () => { if (state.isConnected) connect(); };
    const handleChainChanged = () => { if (state.isConnected) connect(); };

    ethereum.on?.("accountsChanged", handleAccountsChanged);
    ethereum.on?.("chainChanged", handleChainChanged);

    return () => {
      ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
      ethereum.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [connect, state.isConnected]);

  return (
    <WalletContext.Provider value={{ ...state, connect, disconnect, switchChain, setContract }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
