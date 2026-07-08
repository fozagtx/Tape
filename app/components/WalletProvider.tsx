"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
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
  hasWallet: boolean;
}

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchChain: () => Promise<void>;
  setContract: (address: string) => void;
  clearContract: () => void;
  clearError: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

async function probeContract(
  address: string,
  provider: ethers.Provider,
  signer: ethers.Signer | null
): Promise<ethers.Contract | null> {
  if (!ethers.isAddress(address)) return null;
  const code = await provider.getCode(address);
  if (code === "0x") return null;
  const probe = new ethers.Contract(address, TAPE_ABI, provider);
  try {
    await probe.nextOrderId();
  } catch {
    return null;
  }
  return new ethers.Contract(address, TAPE_ABI, signer ?? provider);
}

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
    // Assume a wallet may exist; connect() corrects this if none is found.
    hasWallet: true,
  });

  const connect = useCallback(async () => {
    if (
      typeof window === "undefined" ||
      !(window as unknown as Record<string, unknown>).ethereum
    ) {
      setState((s) => ({
        ...s,
        error: "No wallet found. Install MetaMask or another Web3 wallet.",
        hasWallet: false,
      }));
      return;
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
        return;
      }
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const balance = await provider.getBalance(accounts[0]);
      const chainId = Number(network.chainId);

      let contract: ethers.Contract | null = null;
      let contractAddress: string | null = null;
      const configured = (CHAIN_CONFIG.contractAddress || "").trim();
      if (configured) {
        const c = await probeContract(configured, provider, signer);
        if (c) {
          contract = c;
          contractAddress = configured;
        }
      }

      setState({
        address: accounts[0],
        balance: ethers.formatEther(balance),
        chainId,
        isConnected: true,
        isConnecting: false,
        provider,
        signer,
        contract,
        contractAddress,
        error: null,
        hasWallet: true,
      });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to connect wallet";
      const friendly = msg.includes("user rejected")
        ? "Connection rejected in wallet."
        : msg;
      setState((s) => ({
        ...s,
        isConnecting: false,
        error: friendly,
      }));
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
      contract: null,
      contractAddress: null,
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

  const setContract = useCallback(
    (address: string) => {
      if (!state.signer) return;
      const contract = new ethers.Contract(address, TAPE_ABI, state.signer);
      setState((s) => ({
        ...s,
        contract,
        contractAddress: address,
        error: null,
      }));
    },
    [state.signer]
  );

  const clearContract = useCallback(() => {
    setState((s) => ({
      ...s,
      contract: null,
      contractAddress: null,
    }));
  }, []);

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
      if (state.isConnected) connect();
    };
    const handleChainChanged = () => {
      if (state.isConnected) connect();
    };

    ethereum.on?.("accountsChanged", handleAccountsChanged);
    ethereum.on?.("chainChanged", handleChainChanged);

    return () => {
      ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
      ethereum.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [connect, state.isConnected]);

  return (
    <WalletContext.Provider
      value={{
        ...state,
        connect,
        disconnect,
        switchChain,
        setContract,
        clearContract,
        clearError,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
