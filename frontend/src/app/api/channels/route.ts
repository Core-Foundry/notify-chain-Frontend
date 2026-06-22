import { NextResponse } from "next/server";

import {
  buildChannelDestination,
  parseCreateChannelRequest,
  type CreateChannelResponse,
} from "@/src/lib/channel-integrations";
import type { NotificationChannel } from "@/src/lib/mock-data";

const SIMULATED_LATENCY_MS = 400;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const channelRequest = parseCreateChannelRequest(body);

    await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));

    const channel: NotificationChannel = {
      id: `ch_${crypto.randomUUID().slice(0, 8)}`,
      name: channelRequest.name,
      type: channelRequest.type,
      destination: buildChannelDestination(channelRequest),
      connected: true,
      deliveries24h: 0,
      successRate: 100,
      lastDelivery: null,
    };

    const responseBody: CreateChannelResponse = { channel };

    return NextResponse.json(responseBody, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to create the notification channel.";

    return NextResponse.json({ message }, { status: 400 });
  }
}
