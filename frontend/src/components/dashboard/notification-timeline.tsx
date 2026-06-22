"use client";

import { CheckCircle2, Circle, Loader2, XCircle, Clock, TimerOff } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { ChannelIcon } from "@/src/components/dashboard/channel-icon";
import { timeAgo, type NotificationDelivery, type DeliveryStageStatus } from "@/src/lib/mock-data";

const iconMap: Record<DeliveryStageStatus, React.ReactNode> = {
  completed:  <CheckCircle2 className="size-4 text-primary" />,
  processing: <Loader2 className="size-4 animate-spin text-warning" />,
  failed:     <XCircle className="size-4 text-destructive" />,
  pending:    <Circle className="size-4 text-muted-foreground/40" />,
  expired:    <TimerOff className="size-4 text-muted-foreground" />,
};

const lineColor: Record<DeliveryStageStatus, string> = {
  completed:  "bg-primary",
  processing: "bg-warning",
  failed:     "bg-destructive",
  pending:    "bg-border",
  expired:    "bg-muted-foreground/40",
};

interface NotificationTimelineProps {
  delivery: NotificationDelivery;
}

export function NotificationTimeline({ delivery }: NotificationTimelineProps) {
  const lastStage = delivery.stages[delivery.stages.length - 1];
  const overallStatus = lastStage.status === "pending"
    ? delivery.stages.find((s) => s.status === "processing")?.status ?? "pending"
    : lastStage.status;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex size-8 items-center justify-center rounded-lg bg-secondary">
            <ChannelIcon type={delivery.channel} className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              {delivery.eventName}
              <span className="ml-1.5 text-muted-foreground font-normal">·</span>
              <span className="ml-1.5 text-muted-foreground font-normal">{delivery.contract}</span>
            </p>
            <p className="text-xs text-muted-foreground capitalize">{delivery.channel}</p>
          </div>
        </div>
        <StatusChip status={overallStatus} />
      </div>

      {/* Stages */}
      <ol className="mt-5 space-y-0">
        {delivery.stages.map((stage, i) => {
          const isLast = i === delivery.stages.length - 1;
          return (
            <li key={stage.id} className="flex gap-3">
              {/* Icon + line */}
              <div className="flex flex-col items-center">
                <span className="flex size-6 shrink-0 items-center justify-center">
                  {iconMap[stage.status]}
                </span>
                {!isLast && (
                  <span
                    className={cn(
                      "mt-0.5 w-0.5 flex-1 min-h-[1.5rem]",
                      lineColor[stage.status]
                    )}
                  />
                )}
              </div>

              {/* Content */}
              <div className={cn("pb-4 min-w-0", isLast && "pb-0")}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      stage.status === "pending" && "text-muted-foreground"
                    )}
                  >
                    {stage.label}
                  </span>
                  {stage.timestamp ? (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      {timeAgo(stage.timestamp)}
                    </span>
                  ) : null}
                </div>
                {stage.detail ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">{stage.detail}</p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function StatusChip({ status }: { status: DeliveryStageStatus }) {
  const styles: Record<DeliveryStageStatus, string> = {
    completed:  "bg-primary/10 text-primary border-primary/20",
    processing: "bg-warning/10 text-warning border-warning/20",
    failed:     "bg-destructive/10 text-destructive border-destructive/20",
    pending:    "bg-secondary text-muted-foreground border-border",
    expired:    "bg-muted/60 text-muted-foreground border-muted-foreground/30",
  };
  const labels: Record<DeliveryStageStatus, string> = {
    completed:  "Delivered",
    processing: "Processing",
    failed:     "Failed",
    pending:    "Pending",
    expired:    "Expired",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium shrink-0", styles[status])}>
      {labels[status]}
    </span>
  );
}
