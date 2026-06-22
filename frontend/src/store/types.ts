/**
 * Type definitions for the global state management store
 */

import type { ChainEvent, NotificationChannel, NotificationRule, WatchedContract } from '@/src/lib/mock-data';

// Export Types
export type ExportStatus = 'idle' | 'preparing' | 'processing' | 'completing' | 'completed' | 'failed';
export type ExportFormat = 'csv' | 'json' | 'pdf';

export interface ExportJob {
  id: string;
  status: ExportStatus;
  progress: number; // 0-100
  format: ExportFormat;
  dataType: 'events' | 'rules' | 'channels' | 'watchlist';
  totalItems: number;
  processedItems: number;
  estimatedTimeRemaining?: number; // in seconds
  error?: string;
  startedAt: string;
  completedAt?: string;
  downloadUrl?: string;
}

// UI State Types
export type ViewMode = 'grid' | 'list';
export type Theme = 'light' | 'dark' | 'system';

/** Mirror of EventStatus from mock-data — kept here to avoid a circular dep */
export type DashboardStatusFilter = 'delivered' | 'pending' | 'failed' | 'expired';

export interface UIState {
  sidebarOpen: boolean;
  activeModal: string | null;
  viewMode: ViewMode;
  theme: Theme;
  // Dashboard filters
  dashboardChainFilter: string;
  dashboardSearchQuery: string;
  /** Active status filters for the dashboard events feed. Empty array means "show all". */
  dashboardStatusFilters: DashboardStatusFilter[];
  dashboardFilterPresets: DashboardFilterPreset[];
  /** Active status filters for the delivery timeline page. Empty array means "show all". */
  timelineStatusFilters: DashboardStatusFilter[];
  // Export jobs
  exportJobs: ExportJob[];
}

export interface UIActions {
  toggleSidebar: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  setViewMode: (mode: ViewMode) => void;
  setTheme: (theme: Theme) => void;
  setDashboardChainFilter: (chain: string) => void;
  setDashboardSearchQuery: (query: string) => void;
  /** Replace the whole status-filter selection. Pass [] to clear. */
  setDashboardStatusFilters: (statuses: DashboardStatusFilter[]) => void;
  /** Toggle a single status on/off within the multi-select set. */
  toggleDashboardStatusFilter: (status: DashboardStatusFilter) => void;
  /** Replace the whole timeline status-filter selection. Pass [] to clear. */
  setTimelineStatusFilters: (statuses: DashboardStatusFilter[]) => void;
  /** Toggle a single status on/off within the timeline multi-select set. */
  toggleTimelineStatusFilter: (status: DashboardStatusFilter) => void;
  saveDashboardFilterPreset: (name: string) => void;
  updateDashboardFilterPreset: (id: string, name: string) => void;
  deleteDashboardFilterPreset: (id: string) => void;
  applyDashboardFilterPreset: (id: string) => void;
  resetUIState: () => void;

  // Export actions
  startExport: (job: Omit<ExportJob, 'id' | 'progress' | 'processedItems' | 'startedAt' | 'completedAt' | 'downloadUrl'>) => string;
  updateExportProgress: (jobId: string, progress: number, processedItems: number, estimatedTimeRemaining?: number) => void;
  updateExportStatus: (jobId: string, status: ExportStatus, error?: string, downloadUrl?: string) => void;
  removeExportJob: (jobId: string) => void;
  clearCompletedExports: () => void;
}

export interface DashboardFilterPreset {
  id: string;
  name: string;
  dashboardChainFilter: string;
  dashboardSearchQuery: string;
  dashboardStatusFilters: DashboardStatusFilter[];
  createdAt: string;
  updatedAt: string;
}

// Column Visibility Types
export type DashboardColumnId = 'event' | 'args' | 'rule' | 'status' | 'time';
export type WatchlistColumnId = 'contract' | 'type' | 'events' | 'eventsToday' | 'actions';

export interface ColumnVisibility {
  dashboard: Record<DashboardColumnId, boolean>;
  watchlist: Record<WatchlistColumnId, boolean>;
}

// Preferences State Types
export type Language = 'en' | 'es' | 'fr' | 'de';
export type CurrencyDisplay = 'USD' | 'EUR' | 'GBP' | 'JPY';

export interface PreferencesState {
  language: Language;
  currencyDisplay: CurrencyDisplay;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  columnVisibility: ColumnVisibility;
}

export interface PreferencesActions {
  setLanguage: (language: Language) => void;
  setCurrencyDisplay: (currency: CurrencyDisplay) => void;
  toggleNotifications: () => void;
  toggleSound: () => void;
  resetPreferences: () => void;
  setColumnVisibility: (table: keyof ColumnVisibility, visibility: Record<string, boolean>) => void;
  toggleColumn: (table: keyof ColumnVisibility, column: string) => void;
  resetColumnVisibility: (table?: keyof ColumnVisibility) => void;
}

// Data State Types
export interface DataState {
  channels: NotificationChannel[];
  rules: NotificationRule[];
  watchlist: WatchedContract[];
  events: ChainEvent[];
}

export interface DataActions {
  // Channels actions
  updateChannel: (id: string, updates: Partial<NotificationChannel>) => void;
  toggleChannel: (id: string) => void;
  addChannel: (channel: NotificationChannel) => void;
  removeChannel: (id: string) => void;
  
  // Rules actions
  updateRule: (id: string, updates: Partial<NotificationRule>) => void;
  toggleRule: (id: string) => void;
  addRule: (rule: NotificationRule) => void;
  removeRule: (id: string) => void;
  
  // Watchlist actions
  updateWatchlistItem: (id: string, updates: Partial<WatchedContract>) => void;
  toggleWatchlistItem: (id: string) => void;
  addWatchlistItem: (item: WatchedContract) => void;
  removeWatchlistItem: (id: string) => void;

  // Events actions
  updateEvent: (id: string, updates: Partial<ChainEvent>) => void;
  retryNotification: (id: string) => void;

  // Reset actions
  resetData: () => void;
}

// Wallet State Types
export interface WalletState {
  walletAddress: string | null;
  isWalletConnected: boolean;
}

export interface WalletActions {
  setWalletAddress: (address: string | null) => void;
  disconnectWallet: () => void;
}

// Combined Store Types
export interface AppStoreState extends UIState, PreferencesState, DataState, WalletState {}

export interface AppStore extends AppStoreState, UIActions, PreferencesActions, DataActions, WalletActions {}

// Persistence Config
export interface PersistenceConfig {
  key: string;
  storage: Storage;
  version: number;
}
