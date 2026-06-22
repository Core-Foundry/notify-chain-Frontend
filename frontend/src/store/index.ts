import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { AppStore } from './types';
import { uiSlice } from './slices/uiSlice';
import { preferencesSlice } from './slices/preferencesSlice';
import { dataSlice } from './slices/dataSlice';
import { walletSlice } from './slices/walletSlice';

/**
 * Create the app store combining all slices
 * Middleware stack (from bottom to top):
 * 1. immer - enables immutable-style updates
 * 2. persist - saves state to localStorage
 * 3. devtools - enables Redux DevTools integration
 */
export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      immer((...args) => {
        return {
          ...uiSlice(...args),
          ...preferencesSlice(...args),
          ...dataSlice(...args),
          ...walletSlice(...args),
        };
      }),
      {
        name: 'notify-chain-store',
        version: 4,
        migrate: (persistedState, version) => {
          const state = persistedState as Partial<AppStore> | undefined;
          return {
            ...state,
            dashboardFilterPresets: Array.isArray(state?.dashboardFilterPresets)
              ? state.dashboardFilterPresets
              : [],
            timelineStatusFilters: Array.isArray(state?.timelineStatusFilters)
              ? state.timelineStatusFilters
              : [],
          } as Partial<AppStore>;
        },
        storage: {
          getItem: (name) => {
            const item = localStorage.getItem(name);
            return item ? JSON.parse(item) : null;
          },
          setItem: (name, value) => {
            localStorage.setItem(name, JSON.stringify(value));
          },
          removeItem: (name) => {
            localStorage.removeItem(name);
          },
        },
        partialize: (state: AppStore): Partial<AppStore> => ({
          sidebarOpen: state.sidebarOpen,
          viewMode: state.viewMode,
          theme: state.theme,
          dashboardChainFilter: state.dashboardChainFilter,
          dashboardSearchQuery: state.dashboardSearchQuery,
          dashboardStatusFilters: state.dashboardStatusFilters,
          dashboardFilterPresets: state.dashboardFilterPresets,
          timelineStatusFilters: state.timelineStatusFilters,
          language: state.language,
          currencyDisplay: state.currencyDisplay,
          notificationsEnabled: state.notificationsEnabled,
          soundEnabled: state.soundEnabled,
          columnVisibility: state.columnVisibility,
          channels: state.channels,
          rules: state.rules,
          watchlist: state.watchlist,
        }),
      }
    ),
    {
      name: 'notify-chain-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

/**
 * Custom hook for UI state
 * Provides selective state access to prevent unnecessary re-renders
 *
 * @example
 * // Get entire UI state
 * const uiState = useUIState();
 *
 * // Get specific UI state property
 * const sidebarOpen = useUIState((state) => state.sidebarOpen);
 */
export function useUIState(): AppStore;
export function useUIState<T>(selector: (state: AppStore) => T): T;
export function useUIState<T>(selector?: (state: AppStore) => T): T | AppStore {
  const sel = (selector ?? ((state: AppStore) => ({
    sidebarOpen: state.sidebarOpen,
    activeModal: state.activeModal,
    viewMode: state.viewMode,
    theme: state.theme,
    dashboardChainFilter: state.dashboardChainFilter,
    dashboardSearchQuery: state.dashboardSearchQuery,
    dashboardStatusFilters: state.dashboardStatusFilters,
    dashboardFilterPresets: state.dashboardFilterPresets,
    exportJobs: state.exportJobs,
    toggleSidebar: state.toggleSidebar,
    openModal: state.openModal,
    closeModal: state.closeModal,
    setViewMode: state.setViewMode,
    setTheme: state.setTheme,
    setDashboardChainFilter: state.setDashboardChainFilter,
    setDashboardSearchQuery: state.setDashboardSearchQuery,
    setDashboardStatusFilters: state.setDashboardStatusFilters,
    toggleDashboardStatusFilter: state.toggleDashboardStatusFilter,
    setTimelineStatusFilters: state.setTimelineStatusFilters,
    toggleTimelineStatusFilter: state.toggleTimelineStatusFilter,
    timelineStatusFilters: state.timelineStatusFilters,
    saveDashboardFilterPreset: state.saveDashboardFilterPreset,
    updateDashboardFilterPreset: state.updateDashboardFilterPreset,
    deleteDashboardFilterPreset: state.deleteDashboardFilterPreset,
    applyDashboardFilterPreset: state.applyDashboardFilterPreset,
    resetUIState: state.resetUIState,
    startExport: state.startExport,
    updateExportProgress: state.updateExportProgress,
    updateExportStatus: state.updateExportStatus,
    removeExportJob: state.removeExportJob,
    clearCompletedExports: state.clearCompletedExports,
  }))) as (state: AppStore) => T | AppStore;
  return useAppStore(sel);
}

/**
 * Custom hook for user preferences
 * Provides selective state access to prevent unnecessary re-renders
 *
 * @example
 * // Get entire preferences state
 * const prefs = usePreferences();
 *
 * // Get specific preference
 * const language = usePreferences((state) => state.language);
 */
export function usePreferences(): AppStore;
export function usePreferences<T>(selector: (state: AppStore) => T): T;
export function usePreferences<T>(selector?: (state: AppStore) => T): T | AppStore {
  const sel = (selector ?? ((state: AppStore) => ({
    language: state.language,
    currencyDisplay: state.currencyDisplay,
    notificationsEnabled: state.notificationsEnabled,
    soundEnabled: state.soundEnabled,
    columnVisibility: state.columnVisibility,
    setLanguage: state.setLanguage,
    setCurrencyDisplay: state.setCurrencyDisplay,
    toggleNotifications: state.toggleNotifications,
    toggleSound: state.toggleSound,
    resetPreferences: state.resetPreferences,
    setColumnVisibility: state.setColumnVisibility,
    toggleColumn: state.toggleColumn,
    resetColumnVisibility: state.resetColumnVisibility,
  }))) as (state: AppStore) => T | AppStore;
  return useAppStore(sel);
}

/**
 * Custom hook for data management
 * Provides access to channels, rules, and watchlist
 *
 * @example
 * // Get all data
 * const data = useData();
 *
 * // Get specific data slice
 * const channels = useData((state) => state.channels);
 */
export function useData(): AppStore;
export function useData<T>(selector: (state: AppStore) => T): T;
export function useData<T>(selector?: (state: AppStore) => T): T | AppStore {
  const sel = (selector ?? ((state: AppStore) => ({
    channels: state.channels,
    rules: state.rules,
    watchlist: state.watchlist,
    events: state.events,
    updateChannel: state.updateChannel,
    toggleChannel: state.toggleChannel,
    addChannel: state.addChannel,
    removeChannel: state.removeChannel,
    updateRule: state.updateRule,
    toggleRule: state.toggleRule,
    addRule: state.addRule,
    removeRule: state.removeRule,
    updateWatchlistItem: state.updateWatchlistItem,
    toggleWatchlistItem: state.toggleWatchlistItem,
    addWatchlistItem: state.addWatchlistItem,
    removeWatchlistItem: state.removeWatchlistItem,
    updateEvent: state.updateEvent,
    retryNotification: state.retryNotification,
    resetData: state.resetData,
  }))) as (state: AppStore) => T | AppStore;
  return useAppStore(sel);
}

export type {
  AppStore,
  UIState,
  UIActions,
  PreferencesState,
  PreferencesActions,
  DataState,
  DataActions,
  WalletState,
  WalletActions,
  DashboardFilterPreset,
  DashboardStatusFilter,
} from './types';

/**
 * Custom hook for wallet state
 */
export function useWallet(): AppStore;
export function useWallet<T>(selector: (state: AppStore) => T): T;
export function useWallet<T>(selector?: (state: AppStore) => T): T | AppStore {
  const sel = (selector ?? ((state: AppStore) => ({
    walletAddress: state.walletAddress,
    isWalletConnected: state.isWalletConnected,
    setWalletAddress: state.setWalletAddress,
    disconnectWallet: state.disconnectWallet,
  }))) as (state: AppStore) => T | AppStore;
  return useAppStore(sel);
}
