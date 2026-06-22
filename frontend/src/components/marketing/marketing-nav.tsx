import Link from "next/link";
import { Zap } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { ConnectWalletButton } from "@/src/components/ui/connect-wallet-button";
import { ThemeToggle } from "@/src/components/theme-toggle";
import { WalletButton } from "@/src/components/wallet-button";

const links = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#channels", label: "Channels" },
];

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Zap className="size-4" />
          </span>
          <span className="font-semibold tracking-tight">Notify-Chain</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
            <a
              href="https://github.com/Core-Foundry/Notify-Chain"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </Button>
          <ConnectWalletButton />
          <WalletButton className="hidden sm:inline-flex" />
          <Button asChild size="sm">
            <Link href="/dashboard">Open dashboard</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
