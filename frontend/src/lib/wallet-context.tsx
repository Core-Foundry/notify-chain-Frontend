"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
} from "@creit.tech/stellar-wallets-kit";

interface WalletContextValue {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextValue>({
  address: null,
  isConnected: false,
  isConnecting: false,
  connect: async () => {},
  disconnect: () => {},
});

let _kit: StellarWalletsKit | null = null;

function getKit(): StellarWalletsKit {
  if (!_kit) {
    _kit = new StellarWalletsKit({
      network: WalletNetwork.TESTNET,
      selectedWalletId: undefined as unknown as string,
      modules: allowAllModules(),
    });
  }
  return _kit;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      const kit = getKit();
      await kit.openModal({
        onWalletSelected: async (option) => {
          kit.setWallet(option.id);
          const { address: walletAddress } = await kit.getAddress();
          setAddress(walletAddress);
        },
      });
    } catch {
      // user closed modal or wallet unavailable
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    _kit = null;
    setAddress(null);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected: !!address,
        isConnecting,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextValue {
  return useContext(WalletContext);
}
