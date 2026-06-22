"use client";

import { useState } from "react";
import { Plus, Send, Activity } from "lucide-react";
import { IntegrationModal } from "@/src/components/common/integration-modal";
import { Topbar } from "@/src/components/dashboard/topbar";
import { StatusBadge } from "@/src/components/dashboard/status-badge";
import {
  ChannelIcon,
  channelIcons,
} from "@/src/components/dashboard/channel-icon";
import { Button } from "@/src/components/ui/button";
import { useModal } from "@/src/hooks/use-modal";
import { useData } from "@/src/store";
import { ExportMenu } from "@/src/components/export-menu";
import {
  channelLabels,
  timeAgo,
  type ChannelType,
  type NotificationChannel,
} from "@/src/lib/mock-data";

const channelTypeBlurb: Record<ChannelType, string> = {
  webhook: "Signed JSON POST with retries",
  email: "Per-event or digest delivery",
  telegram: "Bot messages to chats & groups",
  discord: "Channel and thread routing",
};

export default function ChannelsPage() {
  const channels = useData((state) => state.channels);
  const toggleChannel = useData((state) => state.toggleChannel);
  const addChannel = useData((state) => state.addChannel);
  const channelModal = useModal();
  const [selectedIntegrationType, setSelectedIntegrationType] =
    useState<ChannelType>("webhook");

  const connected = channels.filter((c) => c.connected);
  const totalDeliveries = channels.reduce((s, c) => s + c.deliveries24h, 0);

  function openIntegrationModal(type: ChannelType) {
    setSelectedIntegrationType(type);
    channelModal.open();
  }

  function handleChannelCreated(channel: NotificationChannel) {
    addChannel(channel);
  }

  return (
    <>
      <Topbar
        title="Notification channels"
        description="Where matched events get delivered"
      />

      <div className="flex-1 space-y-6 p-4 md:p-6">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Connected</span>
              <Send className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight">
              {connected.length}
              <span className="text-base text-muted-foreground">
                /{channels.length}
              </span>
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Deliveries (24h)
              </span>
              <Activity className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight">
              {totalDeliveries.toLocaleString()}
            </p>
          </div>
          <div className="flex items-center justify-center">
            <ExportMenu dataType="channels" />
          </div>
          <div className="col-span-2 flex items-center justify-end lg:col-span-1">
            <Button
              className="w-full lg:w-auto"
              onClick={() => openIntegrationModal(selectedIntegrationType)}
            >
              <Plus className="size-4" />
              Add channel
            </Button>
          </div>
        </div>

        {/* Channel cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {channels.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-secondary text-foreground">
                    <ChannelIcon type={c.type} className="size-5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{c.name}</h3>
                      <StatusBadge
                        tone={c.connected ? "success" : "muted"}
                        label={c.connected ? "connected" : "disconnected"}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {channelLabels[c.type]} · {channelTypeBlurb[c.type]}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-muted-foreground">
                {c.destination}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <Metric
                  label="Sent 24h"
                  value={c.deliveries24h.toLocaleString()}
                />
                <Metric
                  label="Success"
                  value={c.connected ? `${c.successRate}%` : "—"}
                />
                <Metric label="Last" value={timeAgo(c.lastDelivery)} />
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" size="sm">
                  Send test
                </Button>
                <Button
                  variant={c.connected ? "ghost" : "default"}
                  size="sm"
                  onClick={() => toggleChannel(c.id)}
                >
                  {c.connected ? "Disconnect" : "Connect"}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Available integrations */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-medium">Add a new channel</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Connect a destination to start receiving matched events.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(Object.keys(channelIcons) as ChannelType[]).map((type) => (
              <button
                key={type}
                aria-label={`Add ${channelLabels[type]} channel`}
                className="flex flex-col items-center gap-2 rounded-lg border border-border bg-background p-4 text-sm capitalize transition-colors hover:border-primary/40 hover:text-primary"
                onClick={() => openIntegrationModal(type)}
                type="button"
              >
                <ChannelIcon type={type} className="size-5" />
                {channelLabels[type]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <IntegrationModal
        open={channelModal.isOpen}
        integrationType={selectedIntegrationType}
        onClose={channelModal.close}
        onChannelCreated={handleChannelCreated}
      />
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-secondary/50 py-2">
      <p className="text-sm font-medium">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
