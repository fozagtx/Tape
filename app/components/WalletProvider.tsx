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
  /** Signer-bound — place/cancel only. Never use for polling. */
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
  /**
   * Always the public-RPC read contract.
   * Market polls MUST use this so MetaMask is not hammered with eth_calls.
   */
  contract: ethers.Contract;
  /** Wallet signer contract for transactions. Null if not connected. */
  writeContract: ethers.Contract | null;
  contractAddress: string;
  error: string | null;
  hasWallet: boolean;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  switchChain: () => Promise<void>;
  clearError: () => void;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export const CONTRACT_ADDRESS = CHAIN_CONFIG.contractAddress;

/** Single public-RPC contract for all reads */
const readContract = new ethers.Contract(
  CONTRACT_ADDRESS,
  TAPE_ABI,
  getReadProvider()
);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    balance: "—",
    chainId: null,
    isConnected: false,
    isConnecting: false,
    provider: null,
    signer: null,
    writeContract: null,
    error: null,
    hasWallet: true,
  });

  /** Balance via public read RPC (not MetaMask) — avoids MM balance spam */
  const refreshBalance = useCallback(async () => {
    const addr = state.address;
    if (!addr) return;
    try {
      const bal = await getReadProvider().getBalance(addr);
      setState((s) => ({ ...s, balance: ethers.formatEther(bal) }));
    } catch {
      /* keep previous balance if RPC is throttled */
    }
  }, [state.address]);

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
      // Only request accounts + chainId via wallet. Do NOT call eth_getBalance
      // through MetaMask (public BOT RPC returns -32002 under load).
      const accounts = (await ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];
      if (!accounts?.length) {
        setState((s) => ({
          ...s,
          isConnecting: false,
          error: "No account selected in wallet.",
        }));
        return false;
      }

      const chainHex = (await ethereum.request({
        method: "eth_chainId",
      })) as string;
      const chainId = parseInt(chainHex, 16);

      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const writeContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        TAPE_ABI,
        signer
      );

      setState({
        address: accounts[0],
        balance: "—",
        chainId,
        isConnected: true,
        isConnecting: false,
        provider,
        signer,
        writeContract,
        error: null,
        hasWallet: true,
      });

      // Balance later via public RPC (non-blocking)
      void getReadProvider()
        .getBalance(accounts[0])
        .then((bal) => {
          setState((s) =>
            s.address === accounts[0]
              ? { ...s, balance: ethers.formatEther(bal) }
              : s
          );
        })
        .catch(() => {
          /* RPC busy — leave "—" */
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
          "BOT public RPC is rate-limited. Wait ~30s and try again.";
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
      balance: "—",
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
      // ALWAYS public RPC for reads — never MetaMask for book/stats polls
      contract: readContract,
      writeContract: state.writeContract,
      contractAddress: CONTRACT_ADDRESS,
      error: state.error,
      hasWallet: state.hasWallet,
      connect,
      disconnect,
      switchChain,
      clearError,
      refreshBalance,
    }),
    [state, connect, disconnect, switchChain, clearError, refreshBalance]
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
