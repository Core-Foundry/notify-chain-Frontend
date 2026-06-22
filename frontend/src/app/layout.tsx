import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/src/components/providers";
import "./globals.css";
import { ThemeProvider } from "@/src/components/theme-provider";
import { WalletProvider } from "@/src/components/wallet-provider";
import { Toaster } from "@/src/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Notify-Chain — Track and react to on-chain events",
    template: "%s · Notify-Chain",
  },
  description:
    "A contract + off-chain helper system for tracking and reacting to on-chain events. Monitor contracts, define rules, and route notifications to any channel.",
  keywords: [
    "blockchain",
    "smart contracts",
    "event monitoring",
    "webhooks",
    "notifications",
    "web3 infrastructure",
    "on-chain events",
  ],
  openGraph: {
    title: "Notify-Chain — Track and react to on-chain events",
    description:
      "Monitor contracts, define notification rules, and route on-chain events to webhooks, email, Telegram, and Discord.",
    siteName: "Notify-Chain",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-background" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
        suppressHydrationWarning={true}
      >
        <Providers>{children}</Providers>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <WalletProvider>
            {children}
          </WalletProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
