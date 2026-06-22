"use client";

import { useMemo, Suspense } from "react";
import { Activity } from "lucide-react";
import { Topbar } from "@/src/components/dashboard/topbar";
import { NotificationTimeline } from "@/src/components/dashboard/notification-timeline";
import { TimelineFilterChipGroup } from "@/src/components/dashboard/timeline-filter-chip-group";
import { deliveryTimelines } from "@/src/lib/mock-data";
import { useUIState } from "@/src/store";

const statusOrder: Record<string, number> = {
  failed: 0,
  expired: 1,
  processing: 2,
  pending: 3,
  completed: 4,
};

const statusMap: Record<string, string> = {
  completed: "delivered",
  processing: "pending",
  pending: "pending",
  failed: "failed",
  expired: "expired",
};

function getComputedOverallStatus(delivery: (typeof deliveryTimelines)[number]) {
  const last = delivery.stages[delivery.stages.length - 1];
  if (last.status !== "pending") return last.status;
  return delivery.stages.find((s) => s.status === "processing")?.status ?? "pending";
}

export default function TimelinePage() {
  const timelineStatusFilters = useUIState((s) => s.timelineStatusFilters);

  const computedDeliveries = useMemo(() => {
    return deliveryTimelines.map((d) => ({
      ...d,
      computedStatus: getComputedOverallStatus(d),
    }));
  }, []);

  const sorted = useMemo(() => {
    const filtered = computedDeliveries.filter((d) => {
      if (timelineStatusFilters.length === 0) return true;
      const mapped = statusMap[d.computedStatus];
      return timelineStatusFilters.includes(mapped as any);
    });

    return filtered.sort(
      (a, b) => (statusOrder[a.computedStatus] ?? 99) - (statusOrder[b.computedStatus] ?? 99)
    );
  }, [computedDeliveries, timelineStatusFilters]);

  const counts = useMemo(() => {
    const res = { delivered: 0, pending: 0, failed: 0, expired: 0 };
    for (const d of computedDeliveries) {
      const status = d.computedStatus;
      if (status === "completed") {
        res.delivered++;
      } else if (status === "processing" || status === "pending") {
        res.pending++;
      } else if (status === "failed") {
        res.failed++;
      } else if (status === "expired") {
        res.expired++;
      }
    }
    return res;
  }, [computedDeliveries]);

  return (
    <>
      <Topbar
        title="Delivery timeline"
        description="Lifecycle of each notification from creation to delivery"
      />

      <div className="flex-1 space-y-6 p-4 md:p-6">
        {/* Summary strip */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Delivered" value={counts.delivered} tone="primary" />
          <Stat label="Pending" value={counts.pending} tone="warning" />
          <Stat label="Failed" value={counts.failed} tone="destructive" />
          <Stat label="Expired" value={counts.expired} tone="muted" />
        </div>

        {/* Filter controls */}
        <div className="border-b border-border pb-4">
          <Suspense fallback={<div className="h-9" />}>
            <TimelineFilterChipGroup />
          </Suspense>
        </div>

        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card py-16 text-muted-foreground">
            <Activity className="size-8 opacity-40" />
            <p className="text-sm">No delivery records match your filters.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {sorted.map((d) => (
              <NotificationTimeline key={d.id} delivery={d} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "primary" | "warning" | "destructive" | "muted";
}) {
  const colors = {
    primary: "text-primary",
    warning: "text-warning",
    destructive: "text-destructive",
    muted: "text-muted-foreground",
  };
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tracking-tight ${colors[tone]}`}>
        {value}
      </p>
    </div>
  );
}
