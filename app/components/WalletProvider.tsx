"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { flushSync } from "react-dom";
import { ethers } from "ethers";
import { CHAIN_CONFIG } from "@/lib/config";
import { TAPE_ABI } from "@/lib/abi";
import { getReadProvider, isRpcThrottleError } from "@/lib/rpc";

const SESSION_KEY = "tape_wallet_connected";

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

const readContract = new ethers.Contract(
  CONTRACT_ADDRESS,
  TAPE_ABI,
  getReadProvider()
);

function markSession(address: string) {
  try {
    sessionStorage.setItem(SESSION_KEY, address);
  } catch {
    /* ignore */
  }
}

function clearSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function hasWalletSession(): boolean {
  try {
    return Boolean(sessionStorage.getItem(SESSION_KEY));
  } catch {
    return false;
  }
}

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

  const refreshBalance = useCallback(async () => {
    const addr = state.address;
    if (!addr) return;
    try {
      const bal = await getReadProvider().getBalance(addr);
      setState((s) => ({ ...s, balance: ethers.formatEther(bal) }));
    } catch {
      /* keep previous */
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

      let chainId = 0;
      try {
        const chainHex = (await ethereum.request({
          method: "eth_chainId",
        })) as string;
        chainId = parseInt(chainHex, 16);
      } catch {
        chainId = 0;
      }

      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const writeContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        TAPE_ABI,
        signer
      );

      // Force React to commit before navigation so /trade sees isConnected
      flushSync(() => {
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
      });
      markSession(accounts[0]);

      void getReadProvider()
        .getBalance(accounts[0])
        .then((bal) => {
          setState((s) =>
            s.address === accounts[0]
              ? { ...s, balance: ethers.formatEther(bal) }
              : s
          );
        })
        .catch(() => {});

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
    clearSession();
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

  // Restore session if user already authorized this site (eth_accounts)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hasWalletSession()) return;
    if (!(window as unknown as { ethereum?: unknown }).ethereum) return;

    let cancelled = false;
    void (async () => {
      try {
        const ethereum = (
          window as unknown as { ethereum: ethers.Eip1193Provider }
        ).ethereum;
        const accounts = (await ethereum.request({
          method: "eth_accounts",
        })) as string[];
        if (cancelled || !accounts?.length) return;
        // Re-run full connect without prompting if already authorized
        await connect();
      } catch {
        clearSession();
      }
    })();

    return () => {
      cancelled = true;
    };
    // only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const handleAccountsChanged = (accounts: unknown) => {
      const list = accounts as string[];
      if (!list?.length) {
        disconnect();
        return;
      }
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
  }, [connect, disconnect, state.isConnected]);

  const value = useMemo<WalletContextType>(
    () => ({
      address: state.address,
      balance: state.balance,
      chainId: state.chainId,
      isConnected: state.isConnected,
      isConnecting: state.isConnecting,
      provider: state.provider,
      signer: state.signer,
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
