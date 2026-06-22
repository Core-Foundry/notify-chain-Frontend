"use client";

import { Wallet, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useWallet } from "@/src/lib/wallet-context";

function shortenAddress(address: string): string {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

interface ConnectWalletButtonProps {
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost" | "secondary";
}

export function ConnectWalletButton({
  size = "sm",
  variant = "outline",
}: ConnectWalletButtonProps) {
  const { address, isConnected, isConnecting, connect, disconnect } =
    useWallet();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-1">
        <span className="hidden rounded-md border border-border bg-card px-2.5 py-1 font-mono text-xs text-muted-foreground sm:inline-block">
          {shortenAddress(address)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={disconnect}
          aria-label="Disconnect wallet"
          className="size-8"
        >
          <LogOut className="size-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={connect}
      disabled={isConnecting}
      aria-label="Connect wallet"
    >
      {isConnecting ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Wallet className="size-3.5" />
      )}
      {isConnecting ? "Connecting…" : "Connect Wallet"}
    </Button>
  );
}
