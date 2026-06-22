"use client";

/**
 * TimelineFilterChipGroup
 *
 * Renders a row of status filter chips for the delivery timeline page.
 * Follows the exact same pattern as FilterChipGroup on the dashboard:
 *   - Multi-select: any combination of statuses can be active simultaneously.
 *   - Empty selection === "show all" (no chips highlighted).
 *   - Selection is kept in sync with the URL via the `tl_status` search param
 *     (comma-separated, e.g. `?tl_status=delivered,expired`).
 *   - Zustand store is updated on every toggle so the page reacts instantly.
 *
 * Uses a separate URL param (`tl_status`) and store slice (`timelineStatusFilters`)
 * so it never conflicts with the dashboard filter state.
 */

import { useCallback, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ListFilter } from "lucide-react";
import { FilterChip } from "@/src/components/ui/filter-chip";
import { STATUS_FILTERS } from "@/src/components/dashboard/filter-chip-group";
import { useUIState } from "@/src/store";
import type { DashboardStatusFilter } from "@/src/store";

// ─── Config ──────────────────────────────────────────────────────────────────

const URL_PARAM = "tl_status";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseUrlStatuses(raw: string | null): DashboardStatusFilter[] {
  if (!raw) return [];
  const valid = new Set<DashboardStatusFilter>(["delivered", "pending", "failed", "expired"]);
  return raw
    .split(",")
    .map((s) => s.trim() as DashboardStatusFilter)
    .filter((s) => valid.has(s));
}

function encodeUrlStatuses(statuses: DashboardStatusFilter[]): string {
  return statuses.join(",");
}

// ─── Component ───────────────────────────────────────────────────────────────

export function TimelineFilterChipGroup() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeFilters = useUIState((s) => s.timelineStatusFilters);
  const setFilters = useUIState((s) => s.setTimelineStatusFilters);
  const toggleFilter = useUIState((s) => s.toggleTimelineStatusFilter);

  // ── Hydrate store from URL or sync URL from store on first render ──────────
  useEffect(() => {
    const hasParam = searchParams.has(URL_PARAM);
    if (hasParam) {
      const fromUrl = parseUrlStatuses(searchParams.get(URL_PARAM));
      // Only update if they differ to avoid a spurious re-render cycle
      const current = activeFilters.slice().sort().join(",");
      const incoming = fromUrl.slice().sort().join(",");
      if (current !== incoming) {
        setFilters(fromUrl);
      }
    } else if (activeFilters.length > 0) {
      // URL has no filters, but store (localStorage) does. Push store state to URL.
      const params = new URLSearchParams(searchParams.toString());
      params.set(URL_PARAM, activeFilters.join(","));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run once on mount

  // ── Keep URL in sync whenever the store selection changes ───────────────
  const pushUrl = useCallback(
    (next: DashboardStatusFilter[]) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.length === 0) {
        params.delete(URL_PARAM);
      } else {
        params.set(URL_PARAM, encodeUrlStatuses(next));
      }
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  // ── Toggle handler ──────────────────────────────────────────────────────
  const handleToggle = useCallback(
    (status: DashboardStatusFilter) => {
      const next = activeFilters.includes(status)
        ? activeFilters.filter((s) => s !== status)
        : [...activeFilters, status];
      toggleFilter(status);
      pushUrl(next);
    },
    [activeFilters, toggleFilter, pushUrl]
  );

  // ── Clear all ───────────────────────────────────────────────────────────
  const handleClearAll = useCallback(() => {
    setFilters([]);
    pushUrl([]);
  }, [setFilters, pushUrl]);

  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div
      role="group"
      aria-label="Filter deliveries by notification status"
      className="flex flex-wrap items-center gap-1.5"
    >
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <ListFilter className="size-3.5" />
        Status
      </span>

      {STATUS_FILTERS.map(({ value, label, icon: Icon, accentClass }) => {
        const isActive = activeFilters.includes(value);
        return (
          <FilterChip
            key={value}
            active={isActive}
            accentClass={accentClass}
            onClick={() => handleToggle(value)}
            aria-label={`${isActive ? "Remove" : "Add"} ${label} filter`}
          >
            <Icon className="size-3" />
            {label}
          </FilterChip>
        );
      })}

      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleClearAll}
          className="ml-1 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          aria-label="Clear all timeline status filters"
        >
          Clear
        </button>
      )}
    </div>
  );
}
