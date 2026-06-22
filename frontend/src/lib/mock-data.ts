// Mock data layer for Notify-Chain.
// All data is in-memory and stands in for the off-chain helper API.

export type Chain = "Ethereum" | "Base" | "Arbitrum" | "Optimism" | "Polygon";

export type EventStatus = "delivered" | "pending" | "failed" | "expired";

export type ChannelType = "webhook" | "email" | "telegram" | "discord";

export type RuleStatus = "active" | "paused";

export interface ChainEvent {
  id: string;
  contract: string;
  contractAddress: string;
  eventName: string;
  chain: Chain;
  blockNumber: number;
  txHash: string;
  status: EventStatus;
  matchedRule: string | null;
  timestamp: string; // ISO
  args: Record<string, string>;
  // Reason the notification delivery failed — only present for failed events.
  failureReason?: string;
}

export interface NotificationRule {
  id: string;
  name: string;
  description: string;
  contract: string;
  eventSignature: string;
  chain: Chain;
  condition: string;
  channels: ChannelType[];
  status: RuleStatus;
  triggered24h: number;
  lastTriggered: string | null;
}

export type NotificationTemplateSnapshot = Pick<
  NotificationRule,
  | "name"
  | "description"
  | "contract"
  | "eventSignature"
  | "chain"
  | "condition"
  | "channels"
  | "status"
>;

export interface NotificationTemplateVersion {
  id: string;
  ruleId: string;
  version: number;
  createdAt: string;
  author: string;
  summary: string;
  snapshot: NotificationTemplateSnapshot;
}

export interface WatchedContract {
  id: string;
  name: string;
  address: string;
  chain: Chain;
  type: "ERC-20" | "ERC-721" | "DeFi" | "Governance" | "Custom";
  events: string[];
  eventsToday: number;
  addedAt: string;
  active: boolean;
}

export interface NotificationChannel {
  id: string;
  name: string;
  type: ChannelType;
  destination: string;
  connected: boolean;
  deliveries24h: number;
  successRate: number; // 0-100
  lastDelivery: string | null;
}

export const CHAINS: Chain[] = [
  "Ethereum",
  "Base",
  "Arbitrum",
  "Optimism",
  "Polygon",
];

export const chainColors: Record<Chain, string> = {
  Ethereum: "#6f7cff",
  Base: "#3b82f6",
  Arbitrum: "#5fb3f3",
  Optimism: "#f0506e",
  Polygon: "#9b7cff",
};

export const events: ChainEvent[] = [
  {
    id: "evt_9f2a",
    contract: "USDC",
    contractAddress: "0xA0b8...eB48",
    eventName: "Transfer",
    chain: "Ethereum",
    blockNumber: 21384712,
    txHash: "0x7b1c...a4e2",
    status: "delivered",
    matchedRule: "Large USDC transfers",
    timestamp: new Date(Date.now() - 1000 * 28).toISOString(),
    args: { from: "0x3c2f...91ab", to: "0x88dE...0f2c", value: "2,400,000" },
  },
  {
    id: "evt_8d71",
    contract: "Aave Pool",
    contractAddress: "0x8787...A3F2",
    eventName: "LiquidationCall",
    chain: "Ethereum",
    blockNumber: 21384709,
    txHash: "0x2af0...77bc",
    status: "delivered",
    matchedRule: "Aave liquidations",
    timestamp: new Date(Date.now() - 1000 * 64).toISOString(),
    args: { user: "0x9a01...c3de", debt: "182,400", collateral: "WETH" },
  },
  {
    id: "evt_7c40",
    contract: "Uniswap V3",
    contractAddress: "0xE592...1564",
    eventName: "Swap",
    chain: "Base",
    blockNumber: 18920341,
    txHash: "0x44bd...1a9f",
    status: "pending",
    matchedRule: "Whale swaps on Base",
    timestamp: new Date(Date.now() - 1000 * 119).toISOString(),
    args: { pool: "WETH/USDC", amount: "640,000", direction: "buy" },
  },
  {
    id: "evt_6b2e",
    contract: "ENS Registry",
    contractAddress: "0x00000...0aB3",
    eventName: "NameRegistered",
    chain: "Ethereum",
    blockNumber: 21384701,
    txHash: "0x91cc...e0d4",
    status: "delivered",
    matchedRule: null,
    timestamp: new Date(Date.now() - 1000 * 205).toISOString(),
    args: { name: "vault.eth", owner: "0x2b7a...44f1", years: "3" },
  },
  {
    id: "evt_5a18",
    contract: "Lido stETH",
    contractAddress: "0xae7a...A84F",
    eventName: "Submitted",
    chain: "Ethereum",
    blockNumber: 21384698,
    txHash: "0x0db2...5fac",
    status: "failed",
    matchedRule: "Lido deposits",
    timestamp: new Date(Date.now() - 1000 * 320).toISOString(),
    args: { sender: "0x77c1...9bd0", amount: "512 ETH" },
    failureReason:
      "Webhook endpoint returned 503 Service Unavailable after 3 retries.",
  },
  {
    id: "evt_4f93",
    contract: "Arbitrum Bridge",
    contractAddress: "0x4Dbd...9aE1",
    eventName: "DepositInitiated",
    chain: "Arbitrum",
    blockNumber: 271820114,
    txHash: "0xcd71...3e20",
    status: "delivered",
    matchedRule: "Bridge deposits",
    timestamp: new Date(Date.now() - 1000 * 488).toISOString(),
    args: { token: "USDC", amount: "94,000", to: "0x55ab...12cd" },
  },
  {
    id: "evt_3e07",
    contract: "Compound v3",
    contractAddress: "0xc3d6...77Bf",
    eventName: "Supply",
    chain: "Optimism",
    blockNumber: 128944210,
    txHash: "0x6610...bb47",
    status: "delivered",
    matchedRule: null,
    timestamp: new Date(Date.now() - 1000 * 612).toISOString(),
    args: { src: "0x12fa...8e90", amount: "38,200 USDC" },
  },
  {
    id: "evt_2d55",
    contract: "Governor Bravo",
    contractAddress: "0xc0Da...0F19",
    eventName: "ProposalCreated",
    chain: "Ethereum",
    blockNumber: 21384640,
    txHash: "0xa8f3...90c1",
    status: "delivered",
    matchedRule: "New governance proposals",
    timestamp: new Date(Date.now() - 1000 * 905).toISOString(),
    args: { id: "248", proposer: "0x4f0c...aa12" },
  },
  {
    id: "evt_1c33",
    contract: "Blur Marketplace",
    contractAddress: "0x0000...0001",
    eventName: "OrdersMatched",
    chain: "Ethereum",
    blockNumber: 21384611,
    txHash: "0x7d92...44ee",
    status: "pending",
    matchedRule: "NFT sales > 50 ETH",
    timestamp: new Date(Date.now() - 1000 * 1240).toISOString(),
    args: { collection: "Azuki", price: "62 ETH" },
  },
  {
    id: "evt_0c22",
    contract: "Maker DSR",
    contractAddress: "0x373a...A4f8",
    eventName: "Join",
    chain: "Ethereum",
    blockNumber: 21384588,
    txHash: "0xb904...12fe",
    status: "failed",
    matchedRule: "DSR deposits",
    timestamp: new Date(Date.now() - 1000 * 1420).toISOString(),
    args: { usr: "0x61aa...77c0", wad: "1,250,000 DAI" },
    failureReason:
      "Telegram API rate limit exceeded (429). Notification was not delivered.",
  },
  {
    id: "evt_0b11",
    contract: "Polygon PoS",
    contractAddress: "0xA0c6...5e2A",
    eventName: "Withdraw",
    chain: "Polygon",
    blockNumber: 64120877,
    txHash: "0x33aa...c7b0",
    status: "delivered",
    matchedRule: null,
    timestamp: new Date(Date.now() - 1000 * 1600).toISOString(),
    args: { user: "0x9911...23ab", amount: "12,000 MATIC" },
  },
  {
    id: "evt_xa01",
    contract: "Stargate Finance",
    contractAddress: "0xaf52...9B2a",
    eventName: "SendMsg",
    chain: "Optimism",
    blockNumber: 128984440,
    txHash: "0xfc12...84de",
    status: "expired",
    matchedRule: "Cross-chain transfers",
    timestamp: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    args: { token: "USDC", amount: "250,000", dst: "Ethereum" },
    failureReason: "Notification TTL of 60 minutes exceeded before endpoint responded.",
  },
  {
    id: "evt_xa02",
    contract: "Curve Finance",
    contractAddress: "0xbeB4...71A4",
    eventName: "TokenExchange",
    chain: "Polygon",
    blockNumber: 64140990,
    txHash: "0x19ab...5e0c",
    status: "expired",
    matchedRule: null,
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    args: { buyer: "0x82d1...f3e0", sold: "750,000 DAI", bought: "USDC" },
    failureReason: "Webhook endpoint unreachable. Notification expired after max retries.",
  },
];

export const rules: NotificationRule[] = [
  {
    id: "rule_01",
    name: "Large USDC transfers",
    description: "Alert when a single USDC transfer exceeds $1M",
    contract: "USDC",
    eventSignature: "Transfer(address,address,uint256)",
    chain: "Ethereum",
    condition: "value > 1,000,000",
    channels: ["webhook", "telegram"],
    status: "active",
    triggered24h: 42,
    lastTriggered: new Date(Date.now() - 1000 * 28).toISOString(),
  },
  {
    id: "rule_02",
    name: "Aave liquidations",
    description: "Notify on every liquidation call in the Aave v3 pool",
    contract: "Aave Pool",
    eventSignature: "LiquidationCall(address,address,uint256)",
    chain: "Ethereum",
    condition: "any",
    channels: ["discord", "email"],
    status: "active",
    triggered24h: 11,
    lastTriggered: new Date(Date.now() - 1000 * 64).toISOString(),
  },
  {
    id: "rule_03",
    name: "Whale swaps on Base",
    description: "Track swaps over $500k on Uniswap V3 (Base)",
    contract: "Uniswap V3",
    eventSignature: "Swap(address,address,int256,int256)",
    chain: "Base",
    condition: "amountUSD > 500,000",
    channels: ["webhook"],
    status: "active",
    triggered24h: 7,
    lastTriggered: new Date(Date.now() - 1000 * 119).toISOString(),
  },
  {
    id: "rule_04",
    name: "New governance proposals",
    description: "Watch for new proposals across governor contracts",
    contract: "Governor Bravo",
    eventSignature: "ProposalCreated(uint256,address)",
    chain: "Ethereum",
    condition: "any",
    channels: ["telegram", "discord"],
    status: "active",
    triggered24h: 2,
    lastTriggered: new Date(Date.now() - 1000 * 905).toISOString(),
  },
  {
    id: "rule_05",
    name: "NFT sales > 50 ETH",
    description: "High-value NFT settlements on Blur and OpenSea",
    contract: "Blur Marketplace",
    eventSignature: "OrdersMatched(bytes32,bytes32)",
    chain: "Ethereum",
    condition: "price > 50 ETH",
    channels: ["webhook", "email"],
    status: "paused",
    triggered24h: 0,
    lastTriggered: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
  },
  {
    id: "rule_06",
    name: "Bridge deposits",
    description: "Monitor large deposits into canonical L2 bridges",
    contract: "Arbitrum Bridge",
    eventSignature: "DepositInitiated(address,address,uint256)",
    chain: "Arbitrum",
    condition: "amount > 50,000",
    channels: ["webhook"],
    status: "active",
    triggered24h: 19,
    lastTriggered: new Date(Date.now() - 1000 * 488).toISOString(),
  },
];

export const templateVersions: NotificationTemplateVersion[] = [
  {
    id: "ver_rule_01_01",
    ruleId: "rule_01",
    version: 1,
    createdAt: "2026-05-10T09:30:00.000Z",
    author: "Maya Patel",
    summary: "Initial alert template for high-value USDC transfers.",
    snapshot: {
      name: "Large USDC transfers",
      description: "Alert when a single USDC transfer exceeds $1M",
      contract: "USDC",
      eventSignature: "Transfer(address,address,uint256)",
      chain: "Ethereum",
      condition: "value > 1,000,000",
      channels: ["webhook"],
      status: "active",
    },
  },
  {
    id: "ver_rule_01_02",
    ruleId: "rule_01",
    version: 2,
    createdAt: "2026-05-18T14:10:00.000Z",
    author: "Maya Patel",
    summary: "Added Telegram delivery for the trading team.",
    snapshot: {
      name: "Large USDC transfers",
      description: "Alert when a single USDC transfer exceeds $1M",
      contract: "USDC",
      eventSignature: "Transfer(address,address,uint256)",
      chain: "Ethereum",
      condition: "value > 1,000,000",
      channels: ["webhook", "telegram"],
      status: "active",
    },
  },
  {
    id: "ver_rule_01_03",
    ruleId: "rule_01",
    version: 3,
    createdAt: "2026-06-02T08:45:00.000Z",
    author: "Omar Hassan",
    summary: "Expanded the description and tightened the wording.",
    snapshot: {
      name: "Large USDC transfers",
      description: "Alert when a single USDC transfer exceeds $1,000,000",
      contract: "USDC",
      eventSignature: "Transfer(address,address,uint256)",
      chain: "Ethereum",
      condition: "value >= 1,000,000",
      channels: ["webhook", "telegram"],
      status: "active",
    },
  },
  {
    id: "ver_rule_01_04",
    ruleId: "rule_01",
    version: 4,
    createdAt: "2026-06-14T16:25:00.000Z",
    author: "Maya Patel",
    summary: "Current live version after a short review pass.",
    snapshot: {
      name: "Large USDC transfers",
      description: "Alert when a single USDC transfer exceeds $1M",
      contract: "USDC",
      eventSignature: "Transfer(address,address,uint256)",
      chain: "Ethereum",
      condition: "value > 1,000,000",
      channels: ["webhook", "telegram"],
      status: "active",
    },
  },
  {
    id: "ver_rule_02_01",
    ruleId: "rule_02",
    version: 1,
    createdAt: "2026-05-12T12:00:00.000Z",
    author: "Maya Patel",
    summary: "Base liquidation alert template.",
    snapshot: {
      name: "Aave liquidations",
      description: "Notify on every liquidation call in the Aave v3 pool",
      contract: "Aave Pool",
      eventSignature: "LiquidationCall(address,address,uint256)",
      chain: "Ethereum",
      condition: "any",
      channels: ["email"],
      status: "active",
    },
  },
  {
    id: "ver_rule_02_02",
    ruleId: "rule_02",
    version: 2,
    createdAt: "2026-06-08T10:15:00.000Z",
    author: "Samir Khan",
    summary: "Restored Discord delivery for the risk team.",
    snapshot: {
      name: "Aave liquidations",
      description: "Notify on every liquidation call in the Aave v3 pool",
      contract: "Aave Pool",
      eventSignature: "LiquidationCall(address,address,uint256)",
      chain: "Ethereum",
      condition: "any",
      channels: ["discord", "email"],
      status: "active",
    },
  },
];

export const watchlist: WatchedContract[] = [
  {
    id: "wc_01",
    name: "USDC",
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    chain: "Ethereum",
    type: "ERC-20",
    events: ["Transfer", "Approval"],
    eventsToday: 18420,
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    active: true,
  },
  {
    id: "wc_02",
    name: "Aave v3 Pool",
    address: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA3F2",
    chain: "Ethereum",
    type: "DeFi",
    events: ["Supply", "Borrow", "LiquidationCall"],
    eventsToday: 1240,
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
    active: true,
  },
  {
    id: "wc_03",
    name: "Uniswap V3 Router",
    address: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    chain: "Base",
    type: "DeFi",
    events: ["Swap", "Mint", "Burn"],
    eventsToday: 9821,
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    active: true,
  },
  {
    id: "wc_04",
    name: "Azuki",
    address: "0xED5AF388653567Af2F388E6224dC7C4b3241C544",
    chain: "Ethereum",
    type: "ERC-721",
    events: ["Transfer", "OrdersMatched"],
    eventsToday: 312,
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    active: true,
  },
  {
    id: "wc_05",
    name: "Compound Governor",
    address: "0xc0Da02939E1441F497fd74F78cE7Decb17B66529",
    chain: "Ethereum",
    type: "Governance",
    events: ["ProposalCreated", "VoteCast"],
    eventsToday: 24,
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    active: false,
  },
  {
    id: "wc_06",
    name: "Arbitrum Bridge",
    address: "0x4Dbd4fc535Ac27206064B68FfCf827b0A60BAB3F",
    chain: "Arbitrum",
    type: "Custom",
    events: ["DepositInitiated", "WithdrawalFinalized"],
    eventsToday: 880,
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    active: true,
  },
];

export const channels: NotificationChannel[] = [
  {
    id: "ch_01",
    name: "Ops Webhook",
    type: "webhook",
    destination: "https://api.acme.xyz/hooks/notify-chain",
    connected: true,
    deliveries24h: 1284,
    successRate: 99.7,
    lastDelivery: new Date(Date.now() - 1000 * 28).toISOString(),
  },
  {
    id: "ch_02",
    name: "Trading Telegram",
    type: "telegram",
    destination: "@acme_alerts",
    connected: true,
    deliveries24h: 642,
    successRate: 100,
    lastDelivery: new Date(Date.now() - 1000 * 119).toISOString(),
  },
  {
    id: "ch_03",
    name: "Risk Discord",
    type: "discord",
    destination: "#liquidations",
    connected: true,
    deliveries24h: 211,
    successRate: 98.1,
    lastDelivery: new Date(Date.now() - 1000 * 64).toISOString(),
  },
  {
    id: "ch_04",
    name: "On-call Email",
    type: "email",
    destination: "alerts@acme.xyz",
    connected: false,
    deliveries24h: 0,
    successRate: 0,
    lastDelivery: null,
  },
];

// 24h sparkline / area chart series — events captured per hour.
export const eventVolume = [
  { hour: "00:00", events: 820, matched: 180 },
  { hour: "02:00", events: 640, matched: 132 },
  { hour: "04:00", events: 510, matched: 98 },
  { hour: "06:00", events: 720, matched: 164 },
  { hour: "08:00", events: 1180, matched: 286 },
  { hour: "10:00", events: 1640, matched: 402 },
  { hour: "12:00", events: 1980, matched: 511 },
  { hour: "14:00", events: 2240, matched: 588 },
  { hour: "16:00", events: 2010, matched: 503 },
  { hour: "18:00", events: 1720, matched: 441 },
  { hour: "20:00", events: 1380, matched: 332 },
  { hour: "22:00", events: 1040, matched: 248 },
];

export const dashboardStats = {
  eventsToday: 31840,
  eventsTodayDelta: 12.4,
  notificationsSent: 4218,
  notificationsDelta: 8.1,
  activeRules: rules.filter((r) => r.status === "active").length,
  watchedContracts: watchlist.length,
  deliverySuccess: 99.2,
  avgLatencyMs: 840,
};

export const channelLabels: Record<ChannelType, string> = {
  webhook: "Webhook",
  email: "Email",
  telegram: "Telegram",
  discord: "Discord",
};

// Notification delivery channels — the surfaces a notification can be sent on.
// Distinct from NotificationChannel (a configured destination); these are the
// aggregate per-channel delivery metrics surfaced on the dashboard.
export type DeliveryChannel = "email" | "sms" | "push" | "in-app";

export interface ChannelMetric {
  channel: DeliveryChannel;
  successful: number;
  failed: number;
}

export const deliveryChannelLabels: Record<DeliveryChannel, string> = {
  email: "Email",
  sms: "SMS",
  push: "Push",
  "in-app": "In-App",
};

export const DELIVERY_CHANNELS: DeliveryChannel[] = [
  "email",
  "sms",
  "push",
  "in-app",
];

export const channelMetrics: ChannelMetric[] = [
  { channel: "email", successful: 1_284_900, failed: 4_120 },
  { channel: "sms", successful: 642_300, failed: 8_840 },
  { channel: "push", successful: 2_481_500, failed: 15_240 },
  { channel: "in-app", successful: 318_420, failed: 910 },
];

// ---------------------------------------------------------------------------
// Notification activity heatmap
//
// Deliveries are modelled as individual records (a timestamp + channel + status)
// so the dashboard can group them by hour into a day x hour heatmap. The data is
// generated deterministically from a seeded PRNG: it stays stable across renders
// and reloads (no Math.random flicker) and is reproducible for a given anchor.
// ---------------------------------------------------------------------------

export interface DeliveryRecord {
  id: string;
  channel: DeliveryChannel;
  timestamp: string; // ISO
  status: "delivered" | "failed";
}

export interface HeatmapRange {
  value: string;
  label: string;
  days: number;
}

// Selectable look-back windows for the heatmap. `days` drives how many rows the
// grid renders; the widest window also bounds how much history we generate.
export const HEATMAP_RANGES: HeatmapRange[] = [
  { value: "7", label: "Last 7 days", days: 7 },
  { value: "14", label: "Last 14 days", days: 14 },
  { value: "30", label: "Last 30 days", days: 30 },
];

export const MAX_HEATMAP_DAYS = Math.max(...HEATMAP_RANGES.map((r) => r.days));

// One hour bucket within a day: how many deliveries landed in that hour.
export interface HeatmapCell {
  date: string; // local day key, e.g. "2026-6-19"
  hour: number; // 0-23
  count: number;
}

// A single day row of the heatmap: 24 hour cells plus a daily total.
export interface HeatmapDay {
  date: string;
  label: string; // "Jun 19"
  weekday: string; // "Fri"
  total: number;
  cells: HeatmapCell[]; // always length 24, hour 0..23
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Relative delivery volume per hour of day (0-23). Mirrors the diurnal shape of
// `eventVolume`: quiet overnight, ramping up to a busy afternoon peak.
const HOURLY_WEIGHTS = [
  0.2, 0.15, 0.12, 0.1, 0.1, 0.16, 0.32, 0.52, 0.72, 0.86, 0.95, 1.0, 1.05,
  1.12, 1.15, 1.06, 0.96, 0.86, 0.72, 0.62, 0.5, 0.4, 0.3, 0.24,
];

// Small, fast, deterministic PRNG (LCG). Seeded so the mock heatmap is stable.
function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

// Local-day key so deliveries bucket by the viewer's day, not UTC.
function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/**
 * Generate delivery records for the widest heatmap window ending at `now`.
 * Always covers MAX_HEATMAP_DAYS so every range slices from the same history —
 * "last 7 days" is identical whether the 7- or 30-day window is selected.
 */
export function generateDeliveries(now: Date = new Date()): DeliveryRecord[] {
  const rand = seeded(0x5f3759df);
  const records: DeliveryRecord[] = [];
  const today = startOfDay(now);
  let n = 0;

  for (let d = MAX_HEATMAP_DAYS - 1; d >= 0; d--) {
    const day = new Date(today);
    day.setDate(day.getDate() - d);
    const weekend = day.getDay() === 0 || day.getDay() === 6;
    const dayFactor = weekend ? 0.55 : 1;

    for (let h = 0; h < 24; h++) {
      const expected = HOURLY_WEIGHTS[h] * 11 * dayFactor * (0.75 + rand() * 0.5);
      const count = Math.round(expected);
      for (let i = 0; i < count; i++) {
        const ts = new Date(day);
        ts.setHours(h, Math.floor(rand() * 60), Math.floor(rand() * 60), 0);
        // Never emit deliveries in the future (matters for the current hour).
        if (ts.getTime() > now.getTime()) continue;
        records.push({
          id: `dlv_${n.toString(36)}`,
          channel: DELIVERY_CHANNELS[n % DELIVERY_CHANNELS.length],
          timestamp: ts.toISOString(),
          status: rand() < 0.03 ? "failed" : "delivered",
        });
        n++;
      }
    }
  }

  return records;
}

/**
 * Group delivery records into a day x hour matrix for the last `days` days,
 * ordered most-recent-first. Days with no activity are still emitted so the grid
 * keeps a stable shape, and every day always has 24 hour cells.
 */
export function groupDeliveriesByHour(
  records: DeliveryRecord[],
  days: number,
  now: Date = new Date()
): HeatmapDay[] {
  const today = startOfDay(now);
  const start = new Date(today);
  start.setDate(start.getDate() - (days - 1));
  const startMs = start.getTime();

  // Pre-build empty buckets so zero-activity days render as blank rows.
  const buckets = new Map<string, HeatmapDay>();
  for (let d = 0; d < days; d++) {
    const day = new Date(start);
    day.setDate(day.getDate() + d);
    const key = dayKey(day);
    buckets.set(key, {
      date: key,
      label: `${MONTH_LABELS[day.getMonth()]} ${day.getDate()}`,
      weekday: WEEKDAY_LABELS[day.getDay()],
      total: 0,
      cells: Array.from({ length: 24 }, (_, hour) => ({ date: key, hour, count: 0 })),
    });
  }

  for (const record of records) {
    const t = new Date(record.timestamp);
    if (t.getTime() < startMs || t.getTime() > now.getTime()) continue;
    const day = buckets.get(dayKey(t));
    if (!day) continue;
    day.cells[t.getHours()].count += 1;
    day.total += 1;
  }

  // Map insertion order is oldest-first; reverse so today is the top row.
  return Array.from(buckets.values()).reverse();
}

export function timeAgo(iso: string | null): string {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

// ── Delivery Timeline ──────────────────────────────────────────────────────

export type DeliveryStageStatus = "completed" | "processing" | "failed" | "pending" | "expired";

export interface DeliveryStage {
  id: string;
  label: "Created" | "Queued" | "Processing" | "Delivered" | "Failed" | "Expired";
  status: DeliveryStageStatus;
  timestamp: string | null; // ISO or null if not yet reached
  detail?: string;
}

export interface NotificationDelivery {
  id: string;
  eventId: string;
  eventName: string;
  contract: string;
  channel: ChannelType;
  stages: DeliveryStage[];
}

function makeTimeline(
  eventId: string,
  eventName: string,
  contract: string,
  channel: ChannelType,
  finalStatus: "delivered" | "failed" | "processing" | "expired",
  baseMs: number
): NotificationDelivery {
  const t = (offset: number) =>
    new Date(baseMs + offset).toISOString();

  const stageMap: Record<
    "delivered" | "failed" | "processing" | "expired",
    DeliveryStage[]
  > = {
    delivered: [
      { id: "s1", label: "Created",    status: "completed",  timestamp: t(0),     detail: "Event matched rule" },
      { id: "s2", label: "Queued",     status: "completed",  timestamp: t(120),   detail: "Added to dispatch queue" },
      { id: "s3", label: "Processing", status: "completed",  timestamp: t(380),   detail: "Payload built and signed" },
      { id: "s4", label: "Delivered",  status: "completed",  timestamp: t(840),   detail: "200 OK from endpoint" },
    ],
    failed: [
      { id: "s1", label: "Created",    status: "completed",  timestamp: t(0),     detail: "Event matched rule" },
      { id: "s2", label: "Queued",     status: "completed",  timestamp: t(95),    detail: "Added to dispatch queue" },
      { id: "s3", label: "Processing", status: "completed",  timestamp: t(310),   detail: "Payload built and signed" },
      { id: "s4", label: "Failed",     status: "failed",     timestamp: t(620),   detail: "Connection refused after 3 retries" },
    ],
    processing: [
      { id: "s1", label: "Created",    status: "completed",  timestamp: t(0),         detail: "Event matched rule" },
      { id: "s2", label: "Queued",     status: "completed",  timestamp: t(110),       detail: "Added to dispatch queue" },
      { id: "s3", label: "Processing", status: "processing", timestamp: t(290),       detail: "Awaiting endpoint response…" },
      { id: "s4", label: "Delivered",  status: "pending",    timestamp: null },
    ],
    expired: [
      { id: "s1", label: "Created",    status: "completed",  timestamp: t(0),         detail: "Event matched rule" },
      { id: "s2", label: "Queued",     status: "completed",  timestamp: t(100),       detail: "Added to dispatch queue" },
      { id: "s3", label: "Processing", status: "completed",  timestamp: t(310),       detail: "Payload built, delivery attempted" },
      { id: "s4", label: "Expired",    status: "expired",    timestamp: t(3_600_000), detail: "Notification TTL exceeded — dropped after max retries" },
    ],
  };

  return {
    id: `del_${eventId}`,
    eventId,
    eventName,
    contract,
    channel,
    stages: stageMap[finalStatus],
  };
}

const now = Date.now();

export const deliveryTimelines: NotificationDelivery[] = [
  makeTimeline("evt_9f2a", "Transfer",          "USDC",             "webhook",  "delivered",  now - 1000 * 28),
  makeTimeline("evt_8d71", "LiquidationCall",   "Aave Pool",        "discord",  "delivered",  now - 1000 * 64),
  makeTimeline("evt_7c40", "Swap",              "Uniswap V3",       "webhook",  "processing", now - 1000 * 119),
  makeTimeline("evt_5a18", "Submitted",         "Lido stETH",       "email",    "failed",     now - 1000 * 320),
  makeTimeline("evt_4f93", "DepositInitiated",  "Arbitrum Bridge",  "webhook",  "delivered",  now - 1000 * 488),
  makeTimeline("evt_1c33", "OrdersMatched",     "Blur Marketplace", "webhook",  "processing", now - 1000 * 1240),
  makeTimeline("evt_xa01", "SendMsg",           "Stargate Finance", "webhook",  "expired",    now - 1000 * 60 * 75),
  makeTimeline("evt_xa02", "TokenExchange",     "Curve Finance",    "email",    "expired",    now - 1000 * 60 * 180),
];
// ---------------------------------------------------------------------------
// Delivery trend data — used by the configurable delivery-trends chart.
// Each interval holds a series of { label, delivered, failed } buckets.
// ---------------------------------------------------------------------------

export type TrendInterval = "1h" | "24h" | "7d" | "30d";

export interface TrendPoint {
  label: string;
  delivered: number;
  failed: number;
}

export const TREND_INTERVALS: TrendInterval[] = ["1h", "24h", "7d", "30d"];

export const trendIntervalLabels: Record<TrendInterval, string> = {
  "1h": "Last hour",
  "24h": "Last 24 h",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
};

export const deliveryTrends: Record<TrendInterval, TrendPoint[]> = {
  "1h": [
    { label: "00m", delivered: 42, failed: 1 },
    { label: "10m", delivered: 58, failed: 2 },
    { label: "20m", delivered: 37, failed: 0 },
    { label: "30m", delivered: 61, failed: 3 },
    { label: "40m", delivered: 49, failed: 1 },
    { label: "50m", delivered: 54, failed: 2 },
    { label: "60m", delivered: 67, failed: 0 },
  ],
  "24h": [
    { label: "00:00", delivered: 310, failed: 4 },
    { label: "02:00", delivered: 224, failed: 2 },
    { label: "04:00", delivered: 180, failed: 1 },
    { label: "06:00", delivered: 260, failed: 3 },
    { label: "08:00", delivered: 480, failed: 8 },
    { label: "10:00", delivered: 720, failed: 11 },
    { label: "12:00", delivered: 890, failed: 14 },
    { label: "14:00", delivered: 940, failed: 9 },
    { label: "16:00", delivered: 820, failed: 7 },
    { label: "18:00", delivered: 670, failed: 5 },
    { label: "20:00", delivered: 510, failed: 4 },
    { label: "22:00", delivered: 390, failed: 3 },
  ],
  "7d": [
    { label: "Mon", delivered: 5200, failed: 62 },
    { label: "Tue", delivered: 6100, failed: 44 },
    { label: "Wed", delivered: 4800, failed: 91 },
    { label: "Thu", delivered: 7200, failed: 38 },
    { label: "Fri", delivered: 8100, failed: 55 },
    { label: "Sat", delivered: 3900, failed: 20 },
    { label: "Sun", delivered: 3100, failed: 18 },
  ],
  "30d": [
    { label: "Jun 1", delivered: 28400, failed: 320 },
    { label: "Jun 5", delivered: 31200, failed: 280 },
    { label: "Jun 10", delivered: 29800, failed: 410 },
    { label: "Jun 15", delivered: 33500, failed: 190 },
    { label: "Jun 20", delivered: 36100, failed: 240 },
    { label: "Jun 25", delivered: 34700, failed: 310 },
    { label: "Jun 30", delivered: 38200, failed: 170 },
  ],
};
