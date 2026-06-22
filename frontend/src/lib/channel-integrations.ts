import type { ChannelType, NotificationChannel } from "@/src/lib/mock-data";

export interface BaseChannelRequest {
  name: string;
  type: ChannelType;
}

export interface WebhookChannelRequest extends BaseChannelRequest {
  type: "webhook";
  endpointUrl: string;
  signingSecret: string;
}

export interface EmailChannelRequest extends BaseChannelRequest {
  type: "email";
  emailAddress: string;
  deliveryMode: "instant" | "digest";
}

export interface TelegramChannelRequest extends BaseChannelRequest {
  type: "telegram";
  botToken: string;
  chatId: string;
}

export interface DiscordChannelRequest extends BaseChannelRequest {
  type: "discord";
  webhookUrl: string;
}

export type CreateChannelRequest =
  | WebhookChannelRequest
  | EmailChannelRequest
  | TelegramChannelRequest
  | DiscordChannelRequest;

export interface CreateChannelResponse {
  channel: NotificationChannel;
}

export function buildChannelDestination(request: CreateChannelRequest): string {
  switch (request.type) {
    case "webhook":
      return request.endpointUrl;
    case "email":
      return request.emailAddress;
    case "telegram":
      return request.chatId;
    case "discord":
      return request.webhookUrl;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getTrimmedString(
  record: Record<string, unknown>,
  key: string
): string | null {
  const value = record[key];

  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function getChannelType(value: unknown): ChannelType | null {
  if (
    value === "webhook" ||
    value === "email" ||
    value === "telegram" ||
    value === "discord"
  ) {
    return value;
  }

  return null;
}

function validateUrl(url: string, label: string) {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      throw new Error();
    }
  } catch {
    throw new Error(`${label} must be a valid HTTP or HTTPS URL.`);
  }
}

function validateEmail(emailAddress: string) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(emailAddress)) {
    throw new Error("Email address must be valid.");
  }
}

export function parseCreateChannelRequest(input: unknown): CreateChannelRequest {
  if (!isRecord(input)) {
    throw new Error("Request body must be a JSON object.");
  }

  const type = getChannelType(input.type);
  const name = getTrimmedString(input, "name");

  if (!type) {
    throw new Error("A valid integration type is required.");
  }

  if (!name) {
    throw new Error("Channel name is required.");
  }

  switch (type) {
    case "webhook": {
      const endpointUrl = getTrimmedString(input, "endpointUrl");
      const signingSecret =
        typeof input.signingSecret === "string" ? input.signingSecret.trim() : "";

      if (!endpointUrl) {
        throw new Error("Webhook URL is required.");
      }

      validateUrl(endpointUrl, "Webhook URL");

      return {
        type,
        name,
        endpointUrl,
        signingSecret,
      };
    }
    case "email": {
      const emailAddress = getTrimmedString(input, "emailAddress");
      const deliveryMode =
        input.deliveryMode === "instant" || input.deliveryMode === "digest"
          ? input.deliveryMode
          : null;

      if (!emailAddress) {
        throw new Error("Notification email is required.");
      }

      if (!deliveryMode) {
        throw new Error("Delivery mode is required.");
      }

      validateEmail(emailAddress);

      return {
        type,
        name,
        emailAddress,
        deliveryMode,
      };
    }
    case "telegram": {
      const botToken = getTrimmedString(input, "botToken");
      const chatId = getTrimmedString(input, "chatId");

      if (!botToken) {
        throw new Error("Telegram bot token is required.");
      }

      if (!chatId) {
        throw new Error("Telegram chat ID is required.");
      }

      return {
        type,
        name,
        botToken,
        chatId,
      };
    }
    case "discord": {
      const webhookUrl = getTrimmedString(input, "webhookUrl");

      if (!webhookUrl) {
        throw new Error("Discord webhook URL is required.");
      }

      validateUrl(webhookUrl, "Discord webhook URL");

      return {
        type,
        name,
        webhookUrl,
      };
    }
  }
}
