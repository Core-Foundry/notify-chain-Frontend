"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import {
  Activity,
  Bell,
  BookmarkPlus,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  PencilLine,
  Play,
  Radio,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { Topbar } from "@/src/components/dashboard/topbar";
import { StatCard } from "@/src/components/dashboard/stat-card";
import { StatusBadge } from "@/src/components/dashboard/status-badge";
import { EventVolumeChart } from "@/src/components/dashboard/event-volume-chart";
import { RetryNotificationModal } from "@/src/components/dashboard/retry-notification-modal";
import { DeliveryHeatmap } from "@/src/components/dashboard/delivery-heatmap";
import { ChannelMetrics } from "@/src/components/dashboard/channel-metrics";
import { FilterChipGroup } from "@/src/components/dashboard/filter-chip-group";
import { DeliveryTrendsChart } from "@/src/components/dashboard/delivery-trends-chart";
import { useUIState, useData, usePreferences } from "@/src/store";
import { useKeyboardList } from "@/src/lib/use-keyboard-list";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { ExportMenu } from "@/src/components/export-menu";
import { ColumnToggle } from "@/src/components/column-toggle";
import type { DashboardFilterPreset } from "@/src/store/types";
import type { ColumnDef } from "@/src/components/column-toggle";
import {
  dashboardStats,
  CHAINS,
  chainColors,
  timeAgo,
  type ChainEvent,
  type EventStatus,
} from "@/src/lib/mock-data";

// ─── Constants ───────────────────────────────────────────────────────────────

const statusTone: Record<EventStatus, "success" | "pending" | "danger"> = {
  delivered: "success",
  pending: "pending",
  failed: "danger",
  expired: "danger",
};

const chainFilters = ["All", ...CHAINS] as const;

const DASHBOARD_COLUMNS: (ColumnDef & { width: string })[] = [
  { id: "event", label: "Event", width: "1.4fr" },
  { id: "args", label: "Args", width: "1fr" },
  { id: "rule", label: "Rule", width: "1fr" },
  { id: "status", label: "Status", width: "0.8fr" },
  { id: "time", label: "Time", width: "0.6fr" },
];

function gridTemplate(visibility: Record<string, boolean>): string {
  return DASHBOARD_COLUMNS
    .filter((c) => visibility[c.id] !== false)
    .map((c) => c.width)
    .join(" ");
}

// ─── Preset helpers ───────────────────────────────────────────────────────────

function formatFilterSummary(preset: DashboardFilterPreset) {
  const parts = [preset.dashboardChainFilter];
  if (preset.dashboardSearchQuery.trim()) {
    parts.push(`"${preset.dashboardSearchQuery.trim()}"`);
  }
  if (preset.dashboardStatusFilters?.length) {
    parts.push(preset.dashboardStatusFilters.join(", "));
  }
  return parts.join(" | ");
}

function sameFilterState(
  chain: string,
  query: string,
  statusFilters: string[],
  preset: DashboardFilterPreset
) {
  const presetStatuses = preset.dashboardStatusFilters ?? [];
  return (
    chain === preset.dashboardChainFilter &&
    query.trim() === preset.dashboardSearchQuery.trim() &&
    statusFilters.length === presetStatuses.length &&
    statusFilters.every((s) => (presetStatuses as string[]).includes(s))
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const chain = useUIState((state) => state.dashboardChainFilter);
  const query = useUIState((state) => state.dashboardSearchQuery);
  const statusFilters = useUIState((state) => state.dashboardStatusFilters);
  const presets = useUIState((state) => state.dashboardFilterPresets);
  const setChain = useUIState((state) => state.setDashboardChainFilter);
  const setQuery = useUIState((state) => state.setDashboardSearchQuery);
  const events = useData((state) => state.events);

  const savePreset = useUIState((state) => state.saveDashboardFilterPreset);
  const updatePreset = useUIState((state) => state.updateDashboardFilterPreset);
  const deletePreset = useUIState((state) => state.deleteDashboardFilterPreset);
  const applyPreset = useUIState((state) => state.applyDashboardFilterPreset);

  const dashboardVisibility = usePreferences(
    (state) => state.columnVisibility.dashboard
  ) as Record<string, boolean>;
  const cols = gridTemplate(dashboardVisibility);

  // Event whose failed notification is being retried in the modal.
  const [retryEvent, setRetryEvent] = useState<ChainEvent | null>(null);

  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    setIsDesktop(window.innerWidth >= 1024);
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [presetName, setPresetName] = useState("");
  const [presetError, setPresetError] = useState<string | null>(null);

  // ── Filtering (memoized for performance) ─────────────────────────────────
  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchesChain = chain === "All" || e.chain === chain;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        e.contract.toLowerCase().includes(q) ||
        e.eventName.toLowerCase().includes(q) ||
        e.txHash.toLowerCase().includes(q);
      const matchesStatus =
        statusFilters.length === 0 ||
        (statusFilters as string[]).includes(e.status);
      return matchesChain && matchesQuery && matchesStatus;
    });
  }, [events, chain, query, statusFilters]);

  const { listRef: eventsListRef, getRowProps: getEventRowProps } =
    useKeyboardList(filtered.length);

  const activePreset = presets.find((preset) =>
    sameFilterState(chain, query, statusFilters, preset)
  );

  // ── Preset form helpers ───────────────────────────────────────────────────

  function openNewPresetForm() {
    setEditingPresetId(null);
    setPresetName(
      chain === "All" && !query.trim()
        ? ""
        : `${chain !== "All" ? chain : "All"} filters`
    );
    setPresetError(null);
    setIsFormOpen(true);
  }

  function openEditPresetForm(preset: DashboardFilterPreset) {
    setEditingPresetId(preset.id);
    setPresetName(preset.name);
    setPresetError(null);
    setIsFormOpen(true);
  }

  function closePresetForm() {
    setIsFormOpen(false);
    setEditingPresetId(null);
    setPresetName("");
    setPresetError(null);
  }

  function submitPresetForm() {
    const name = presetName.trim();
    if (!name) {
      setPresetError("Give this preset a name before saving.");
      return;
    }
    if (editingPresetId) {
      updatePreset(editingPresetId, name);
    } else {
      savePreset(name);
    }
    closePresetForm();
  }

  function deletePresetById(id: string) {
    if (!window.confirm("Delete this saved filter preset?")) return;
    deletePreset(id);
    if (editingPresetId === id) {
      closePresetForm();
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <Topbar
        title="Event monitor"
        description="Live feed of decoded events across your watched contracts"
      />

      <div className="flex-1 space-y-6 p-4 md:p-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Events today"
            value={dashboardStats.eventsToday.toLocaleString()}
            icon={Activity}
            delta={dashboardStats.eventsTodayDelta}
            metric="events-today"
          />
          <StatCard
            label="Notifications sent"
            value={dashboardStats.notificationsSent.toLocaleString()}
            icon={Bell}
            delta={dashboardStats.notificationsDelta}
            metric="notifications-sent"
          />
          <StatCard
            label="Active rules"
            value={String(dashboardStats.activeRules)}
            icon={Radio}
            hint={`${dashboardStats.watchedContracts} contracts watched`}
            metric="active-rules"
          />
          <StatCard
            label="Delivery success"
            value={`${dashboardStats.deliverySuccess}%`}
            icon={CheckCircle2}
            hint={`${dashboardStats.avgLatencyMs}ms avg latency`}
            metric="delivery-success"
          />
        </div>

        {/* Notification metrics by delivery channel */}
        <ChannelMetrics />

        {/* Event volume chart */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-medium">Event volume</h2>
              <p className="text-xs text-muted-foreground">
                Last 24 hours | captured vs. matched
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="size-2 rounded-full bg-primary" /> Captured
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="size-2 rounded-full bg-muted-foreground" /> Matched
              </span>
            </div>
          </div>
          <div className="p-3">
            <EventVolumeChart />
          </div>
        </div>

        {/* Notification activity heatmap */}
        <DeliveryHeatmap />

        {/* Delivery trends */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_360px]">
          <DeliveryTrendsChart />
        </div>

        {/* Events table + presets sidebar */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_360px]">
          <div className="rounded-xl border border-border bg-card">
            {/* Table header bar */}
            <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-medium">Recent events</h2>
                <StatusBadge tone="success" label="live" pulse />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ExportMenu dataType="events" />
                <ColumnToggle
                  table="dashboard"
                  columns={DASHBOARD_COLUMNS}
                />
                <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5">
                  <Search className="size-4 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Filter events"
                    className="w-32 bg-transparent text-sm outline-none placeholder:text-muted-foreground sm:w-44"
                  />
                </div>
                <div className="flex items-center gap-1 overflow-x-auto">
                  {chainFilters.map((c) => (
                    <button
                      key={c}
                      onClick={() => setChain(c)}
                      className={
                        "whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs transition-colors " +
                        (chain === c
                          ? "bg-secondary text-foreground"
                          : "text-muted-foreground hover:text-foreground")
                      }
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Status filter chips */}
            <div className="border-b border-border px-5 py-3">
              <Suspense fallback={null}>
                <FilterChipGroup />
              </Suspense>
            </div>

            {/* Column headers */}
            <div
              className="hidden gap-4 border-b border-border px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground lg:grid"
              style={{ gridTemplateColumns: cols }}
            >
              {DASHBOARD_COLUMNS.filter((c) => dashboardVisibility[c.id] !== false).map((c) => (
                <span key={c.id} className={c.id === "time" ? "text-right" : ""}>
                  {c.label}
                </span>
              ))}
            </div>

            {/* Events list */}
            <ul
              className="divide-y divide-border"
              ref={eventsListRef as React.RefObject<HTMLUListElement>}
              role="listbox"
              aria-label="Recent events"
            >
              {filtered.map((e, index) => (
                <li
                  key={e.id}
                  {...getEventRowProps(index)}
                  className="grid grid-cols-1 gap-3 px-5 py-4 transition-colors hover:bg-secondary/30 focus:bg-secondary/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring lg:items-center lg:gap-4"
                  style={isDesktop ? { gridTemplateColumns: cols } : undefined}
                  aria-label={`${e.eventName} on ${e.contract}, ${e.chain}, status ${e.status}`}
                >
                  {dashboardVisibility.event !== false && (
                    <div className="flex items-center gap-3">
                      <span
                        className="mt-0.5 size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: chainColors[e.chain] }}
                        title={e.chain}
                      />
                      <div className="min-w-0">
                        <p className="truncate font-mono text-sm">
                          <span className="text-primary">{e.eventName}</span>
                          <span className="text-muted-foreground"> | {e.contract}</span>
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {e.chain} | block {e.blockNumber.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {dashboardVisibility.args !== false && (
                    <div className="truncate font-mono text-xs text-muted-foreground">
                      {Object.entries(e.args)
                        .slice(0, 2)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join("  |  ")}
                    </div>
                  )}

                  {dashboardVisibility.rule !== false && (
                    <div className="text-sm">
                      {e.matchedRule ? (
                        <span className="text-foreground">{e.matchedRule}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  )}

                  {dashboardVisibility.status !== false && (
                    <div className="flex items-center gap-2">
                      <StatusBadge
                        tone={statusTone[e.status]}
                        label={e.status}
                        pulse={e.status === "pending"}
                      />
                      {e.status === "failed" ? (
                        <button
                          onClick={() => setRetryEvent(e)}
                          className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                          aria-label={`Retry notification for ${e.eventName} on ${e.contract}`}
                        >
                          <RefreshCw className="size-3" />
                          Retry
                        </button>
                      ) : null}
                    </div>
                  )}

                  {dashboardVisibility.time !== false && (
                    <div className="flex items-center justify-between gap-2 lg:justify-end">
                      <span className="text-xs text-muted-foreground">
                        {timeAgo(e.timestamp)}
                      </span>
                      <a
                        href="#"
                        className="text-muted-foreground transition-colors hover:text-foreground"
                        aria-label="View transaction"
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                    </div>
                  )}
                </li>
              ))}
            </ul>

            {filtered.length === 0 && (
              <div className="px-5 py-16 text-center text-sm text-muted-foreground">
                No events match your filters.
              </div>
            )}
          </div>

          {/* Saved filter presets sidebar */}
          <aside className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="size-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Saved filter presets</h3>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Capture the current chain, search, and status filters for quick reuse.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={openNewPresetForm}>
                  <BookmarkPlus className="size-4" />
                  Save filter
                </Button>
              </div>

              {activePreset ? (
                <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary">
                  Active preset: {activePreset.name}
                </div>
              ) : (
                <div className="mt-4 rounded-lg border border-dashed border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                  These filters are not saved yet.
                </div>
              )}

              {isFormOpen && (
                <div className="mt-4 rounded-xl border border-border bg-background p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-medium">
                        {editingPresetId ? "Edit preset" : "Save current filters"}
                      </h4>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {editingPresetId
                          ? "This will rename the preset while keeping its saved filters."
                          : "The preset will store the current chain, search, and status filters."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Preset name
                      </label>
                      <Input
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                        placeholder="e.g. Whale watch on Base"
                      />
                    </div>

                    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
                      {formatFilterSummary({
                        id: "preview",
                        name: "preview",
                        dashboardChainFilter: chain,
                        dashboardSearchQuery: query,
                        dashboardStatusFilters: statusFilters,
                        createdAt: "",
                        updatedAt: "",
                      })}
                    </div>

                    {presetError && (
                      <p className="text-xs text-destructive">{presetError}</p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-2">
                    <Button variant="ghost" onClick={closePresetForm}>
                      Cancel
                    </Button>
                    <Button onClick={submitPresetForm}>
                      {editingPresetId ? "Update preset" : "Save preset"}
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-4 space-y-3">
                {presets.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
                    No saved presets yet.
                  </div>
                ) : (
                  presets.map((preset) => {
                    const isCurrent = sameFilterState(chain, query, statusFilters, preset);

                    return (
                      <div
                        key={preset.id}
                        className="rounded-xl border border-border bg-background p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="truncate text-sm font-medium">
                                {preset.name}
                              </h4>
                              {isCurrent && (
                                <StatusBadge tone="success" label="applied" />
                              )}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatFilterSummary(preset)}
                            </p>
                          </div>
                          <span className="whitespace-nowrap text-[11px] text-muted-foreground">
                            {timeAgo(preset.updatedAt)}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => applyPreset(preset.id)}
                          >
                            <Play className="size-4" />
                            Apply
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditPresetForm(preset)}
                          >
                            <PencilLine className="size-4" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => deletePresetById(preset.id)}
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">
              Applying a preset restores every dashboard filter we currently expose.
            </div>
          </aside>
        </div>
      </div>

      <RetryNotificationModal
        event={retryEvent}
        open={retryEvent !== null}
        onOpenChange={(open) => {
          if (!open) setRetryEvent(null);
        }}
      />
    </>
  );
}
