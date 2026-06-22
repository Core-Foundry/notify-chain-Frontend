"use client";

import { WalletProvider } from "@/src/lib/wallet-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return <WalletProvider>{children}</WalletProvider>;
}
