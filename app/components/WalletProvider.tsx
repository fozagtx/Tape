"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { ethers } from "ethers";
import { CHAIN_CONFIG } from "@/lib/config";
import { TAPE_ABI } from "@/lib/abi";
import { getReadProvider, isRpcThrottleError } from "@/lib/rpc";

interface WalletState {
  address: string | null;
  balance: string;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  writeContract: ethers.Contract | null;
  error: string | null;
  hasWallet: boolean;
}

interface WalletContextType {
  address: string | null;
  balance: string;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  contract: ethers.Contract;
  contractAddress: string;
  error: string | null;
  hasWallet: boolean;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  switchChain: () => Promise<void>;
  clearError: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export const CONTRACT_ADDRESS = CHAIN_CONFIG.contractAddress;

const readContract = new ethers.Contract(
  CONTRACT_ADDRESS,
  TAPE_ABI,
  getReadProvider()
);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    balance: "0",
    chainId: null,
    isConnected: false,
    isConnecting: false,
    provider: null,
    signer: null,
    writeContract: null,
    error: null,
    hasWallet: true,
  });

  const connect = useCallback(async (): Promise<boolean> => {
    if (
      typeof window === "undefined" ||
      !(window as unknown as Record<string, unknown>).ethereum
    ) {
      setState((s) => ({
        ...s,
        error: "No wallet found. Install MetaMask or another Web3 wallet.",
        hasWallet: false,
      }));
      return false;
    }

    setState((s) => ({
      ...s,
      isConnecting: true,
      error: null,
      hasWallet: true,
    }));

    try {
      const ethereum = (
        window as unknown as { ethereum: ethers.Eip1193Provider }
      ).ethereum;
      const provider = new ethers.BrowserProvider(ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      if (!accounts?.length) {
        setState((s) => ({
          ...s,
          isConnecting: false,
          error: "No account selected in wallet.",
        }));
        return false;
      }
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      // Balance is best-effort: public BOT RPC often rate-limits eth_getBalance
      let balance = "0";
      try {
        const bal = await provider.getBalance(accounts[0]);
        balance = ethers.formatEther(bal);
      } catch (balErr) {
        if (!isRpcThrottleError(balErr)) {
          console.warn("getBalance failed", balErr);
        }
        // still connect; balance can stay 0 until RPC recovers
      }

      const writeContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        TAPE_ABI,
        signer
      );

      setState({
        address: accounts[0],
        balance,
        chainId,
        isConnected: true,
        isConnecting: false,
        provider,
        signer,
        writeContract,
        error: null,
        hasWallet: true,
      });
      return true;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to connect wallet";
      let friendly = msg.includes("user rejected")
        ? "Connection rejected in wallet."
        : msg;
      if (isRpcThrottleError(err)) {
        friendly =
          "BOT RPC is busy (rate limited). Wait ~30s and try again, or switch MetaMask RPC.";
      }
      setState((s) => ({
        ...s,
        isConnecting: false,
        error: friendly,
      }));
      return false;
    }
  }, []);

  const disconnect = useCallback(() => {
    setState((s) => ({
      address: null,
      balance: "0",
      chainId: null,
      isConnected: false,
      isConnecting: false,
      provider: null,
      signer: null,
      writeContract: null,
      error: null,
      hasWallet: s.hasWallet,
    }));
  }, []);

  const switchChain = useCallback(async () => {
    if (
      typeof window === "undefined" ||
      !(window as unknown as Record<string, unknown>).ethereum
    ) {
      setState((s) => ({
        ...s,
        error: "No wallet found. Install MetaMask first.",
      }));
      return;
    }
    try {
      const ethereum = (
        window as unknown as { ethereum: ethers.Eip1193Provider }
      ).ethereum;
      try {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: CHAIN_CONFIG.chainIdHex }],
        });
      } catch (switchErr: unknown) {
        const code = (switchErr as { code?: number })?.code;
        if (code === 4902) {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: CHAIN_CONFIG.chainIdHex,
                chainName: "BOT Chain Testnet",
                rpcUrls: [CHAIN_CONFIG.rpcUrl],
                blockExplorerUrls: [CHAIN_CONFIG.explorerUrl],
                nativeCurrency: {
                  name: "BOT",
                  symbol: "BOT",
                  decimals: 18,
                },
              },
            ],
          });
        } else {
          throw switchErr;
        }
      }
      await connect();
    } catch {
      setState((s) => ({
        ...s,
        error: "Could not switch network. Add BOT Chain Testnet manually.",
      }));
    }
  }, [connect]);

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !(window as unknown as Record<string, unknown>).ethereum
    )
      return;
    const ethereum = (
      window as unknown as {
        ethereum: ethers.Eip1193Provider & {
          on?: (event: string, cb: (...args: unknown[]) => void) => void;
          removeListener?: (
            event: string,
            cb: (...args: unknown[]) => void
          ) => void;
        };
      }
    ).ethereum;

    const handleAccountsChanged = () => {
      if (state.isConnected) void connect();
    };
    const handleChainChanged = () => {
      if (state.isConnected) void connect();
    };

    ethereum.on?.("accountsChanged", handleAccountsChanged);
    ethereum.on?.("chainChanged", handleChainChanged);

    return () => {
      ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
      ethereum.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [connect, state.isConnected]);

  const value = useMemo<WalletContextType>(
    () => ({
      address: state.address,
      balance: state.balance,
      chainId: state.chainId,
      isConnected: state.isConnected,
      isConnecting: state.isConnecting,
      provider: state.provider,
      signer: state.signer,
      contract: state.writeContract ?? readContract,
      contractAddress: CONTRACT_ADDRESS,
      error: state.error,
      hasWallet: state.hasWallet,
      connect,
      disconnect,
      switchChain,
      clearError,
    }),
    [state, connect, disconnect, switchChain, clearError]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
