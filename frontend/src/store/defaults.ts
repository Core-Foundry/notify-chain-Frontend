/**
 * Default state values for the global store
 */

import type { UIState, PreferencesState, ColumnVisibility } from './types';

export const DEFAULT_COLUMN_VISIBILITY: ColumnVisibility = {
  dashboard: {
    event: true,
    args: true,
    rule: true,
    status: true,
    time: true,
  },
  watchlist: {
    contract: true,
    type: true,
    events: true,
    eventsToday: true,
    actions: true,
  },
};

export const DEFAULT_UI_STATE: UIState = {
  sidebarOpen: true,
  activeModal: null,
  viewMode: 'grid',
  theme: 'system',
  dashboardChainFilter: 'All',
  dashboardSearchQuery: '',
  dashboardStatusFilters: [],
  dashboardFilterPresets: [],
  timelineStatusFilters: [],
  exportJobs: [],
};

export const DEFAULT_PREFERENCES: PreferencesState = {
  language: 'en',
  currencyDisplay: 'USD',
  notificationsEnabled: true,
  soundEnabled: true,
  columnVisibility: DEFAULT_COLUMN_VISIBILITY,
};
