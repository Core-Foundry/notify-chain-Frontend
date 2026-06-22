"use client";

import { Search, Bell } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { ConnectWalletButton } from "@/src/components/ui/connect-wallet-button";
import { ThemeToggle } from "@/src/components/theme-toggle";
import { WalletButton } from "@/src/components/wallet-button";

interface TopbarProps {
  title: string;
  description?: string;
}

export function Topbar({ title, description }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
      <div className="min-w-0">
        <h1 className="truncate text-sm font-semibold tracking-tight">
          {title}
        </h1>
        {description ? (
          <p className="truncate text-xs text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground sm:flex">
          <Search className="size-4" />
          <span className="text-xs">Search events</span>
          <kbd className="ml-2 rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            /
          </kbd>
        </div>
        <ThemeToggle />
        <Button variant="outline" size="icon" aria-label="Notifications">
          <Bell className="size-4" />
        </Button>
        <ConnectWalletButton />
        <WalletButton />
      </div>
    </header>
  );
}
