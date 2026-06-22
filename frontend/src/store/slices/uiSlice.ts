import type { StateCreator } from 'zustand';
import type {
  AppStore,
  UIState,
  UIActions,
  ViewMode,
  Theme,
  DashboardFilterPreset,
  DashboardStatusFilter,
  ExportStatus,
} from '../types';
import { DEFAULT_UI_STATE } from '../defaults';

export const uiSlice: StateCreator<AppStore, [], [], UIState & UIActions> = (set) => ({
  // Initial state
  ...DEFAULT_UI_STATE,

  // Actions
  toggleSidebar: () =>
    set((state) => ({
      sidebarOpen: !state.sidebarOpen,
    })),

  openModal: (modalId: string) =>
    set(() => ({
      activeModal: modalId,
    })),

  closeModal: () =>
    set(() => ({
      activeModal: null,
    })),

  setViewMode: (mode: ViewMode) =>
    set(() => ({
      viewMode: mode,
    })),

  setTheme: (theme: Theme) =>
    set(() => ({
      theme,
    })),

  setDashboardChainFilter: (chain: string) =>
    set(() => ({
      dashboardChainFilter: chain,
    })),

  setDashboardSearchQuery: (query: string) =>
    set(() => ({
      dashboardSearchQuery: query,
    })),

  setDashboardStatusFilters: (statuses: DashboardStatusFilter[]) =>
    set(() => ({
      dashboardStatusFilters: statuses,
    })),

  toggleDashboardStatusFilter: (status: DashboardStatusFilter) =>
    set((state) => {
      const current = state.dashboardStatusFilters;
      const next = current.includes(status)
        ? current.filter((s) => s !== status)
        : [...current, status];
      return { dashboardStatusFilters: next };
    }),

  setTimelineStatusFilters: (statuses: DashboardStatusFilter[]) =>
    set(() => ({
      timelineStatusFilters: statuses,
    })),

  toggleTimelineStatusFilter: (status: DashboardStatusFilter) =>
    set((state) => {
      const current = state.timelineStatusFilters;
      const next = current.includes(status)
        ? current.filter((s) => s !== status)
        : [...current, status];
      return { timelineStatusFilters: next };
    }),

  saveDashboardFilterPreset: (name: string) =>
    set((state) => {
      const now = new Date().toISOString();
      const preset: DashboardFilterPreset = {
        id: `preset_${Date.now().toString(36)}_${Math.random()
          .toString(36)
          .slice(2, 8)}`,
        name,
        dashboardChainFilter: state.dashboardChainFilter,
        dashboardSearchQuery: state.dashboardSearchQuery,
        dashboardStatusFilters: [...state.dashboardStatusFilters],
        createdAt: now,
        updatedAt: now,
      };

      return {
        dashboardFilterPresets: [...state.dashboardFilterPresets, preset],
      };
    }),

  updateDashboardFilterPreset: (id: string, name: string) =>
    set((state) => ({
      dashboardFilterPresets: state.dashboardFilterPresets.map((preset) =>
        preset.id === id
          ? {
              ...preset,
              name,
              updatedAt: new Date().toISOString(),
            }
          : preset
      ),
    })),

  deleteDashboardFilterPreset: (id: string) =>
    set((state) => ({
      dashboardFilterPresets: state.dashboardFilterPresets.filter(
        (preset) => preset.id !== id
      ),
    })),

  applyDashboardFilterPreset: (id: string) =>
    set((state) => {
      const preset = state.dashboardFilterPresets.find((item) => item.id === id);
      if (!preset) return {};

      return {
        dashboardChainFilter: preset.dashboardChainFilter,
        dashboardSearchQuery: preset.dashboardSearchQuery,
        dashboardStatusFilters: preset.dashboardStatusFilters ?? [],
      };
    }),

  resetUIState: () =>
    set((state) => ({
      ...DEFAULT_UI_STATE,
      dashboardFilterPresets: state.dashboardFilterPresets,
    })),

  // Export actions
  startExport: (job) => {
    const newJob = {
      ...job,
      id: `export_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      progress: 0,
      processedItems: 0,
      startedAt: new Date().toISOString(),
    };
    set((state) => ({
      exportJobs: [...state.exportJobs, newJob],
    }));
    return newJob.id;
  },

  updateExportProgress: (jobId, progress, processedItems, estimatedTimeRemaining) =>
    set((state) => ({
      exportJobs: state.exportJobs.map((job) =>
        job.id === jobId
          ? { ...job, progress, processedItems, estimatedTimeRemaining }
          : job
      ),
    })),

  updateExportStatus: (jobId, status, error, downloadUrl) =>
    set((state) => ({
      exportJobs: state.exportJobs.map((job) =>
        job.id === jobId
          ? {
              ...job,
              status,
              error,
              downloadUrl,
              completedAt: status === 'completed' || status === 'failed' ? new Date().toISOString() : job.completedAt,
            }
          : job
      ),
    })),

  removeExportJob: (jobId) =>
    set((state) => ({
      exportJobs: state.exportJobs.filter((job) => job.id !== jobId),
    })),

  clearCompletedExports: () =>
    set((state) => ({
      exportJobs: state.exportJobs.filter((job) => job.status !== 'completed' && job.status !== 'failed'),
    })),
});
