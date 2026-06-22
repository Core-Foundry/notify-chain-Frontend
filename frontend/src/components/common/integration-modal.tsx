"use client";

import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Loader2, X } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { toast } from "@/src/components/ui/use-toast";
import { fetchJson } from "@/src/lib/api";
import {
  type CreateChannelRequest,
  type CreateChannelResponse,
  type DiscordChannelRequest,
  type EmailChannelRequest,
  type TelegramChannelRequest,
  type WebhookChannelRequest,
} from "@/src/lib/channel-integrations";
import type { ChannelType, NotificationChannel } from "@/src/lib/mock-data";
import { channelLabels } from "@/src/lib/mock-data";
import { notifyError } from "@/src/lib/notify";
import { cn } from "@/src/lib/utils";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

const integrationDescriptions: Record<ChannelType, string> = {
  webhook: "Send signed JSON payloads to your own service or workflow.",
  email: "Deliver alerts directly to an inbox instantly or in digest mode.",
  telegram: "Push bot notifications into a Telegram chat or group.",
  discord: "Route alerts into a Discord channel using a webhook.",
};

interface IntegrationModalProps {
  open: boolean;
  integrationType: ChannelType;
  onClose: () => void;
  onChannelCreated: (channel: NotificationChannel) => void;
}

interface SharedFormProps {
  disabled: boolean;
}

interface ChannelFormShellProps {
  title: string;
  description: string;
  submitLabel: string;
  disabled: boolean;
  children: ReactNode;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

interface FieldProps {
  id: string;
  label: string;
  children: ReactNode;
  hint?: string;
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  ).filter((element) => {
    return !element.hasAttribute("disabled") && element.tabIndex !== -1;
  });
}

function Field({ id, label, children, hint }: FieldProps) {
  return (
    <label className="block space-y-2" htmlFor={id}>
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </label>
  );
}

function ChannelFormShell({
  title,
  description,
  submitLabel,
  disabled,
  children,
  onSubmit,
}: ChannelFormShellProps) {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-1">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="space-y-4">{children}</div>

      <div className="flex justify-end">
        <Button disabled={disabled} type="submit">
          {disabled ? (
            <>
              <Loader2 className="animate-spin" />
              Saving…
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}

function WebhookForm({ disabled, onSubmit }: SharedFormProps & {
  onSubmit: (payload: WebhookChannelRequest) => void;
}) {
  const [name, setName] = useState("Ops Webhook");
  const [endpointUrl, setEndpointUrl] = useState("");
  const [signingSecret, setSigningSecret] = useState("");
  const nameId = useId();
  const endpointId = useId();
  const secretId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSubmit({
      type: "webhook",
      name: name.trim(),
      endpointUrl: endpointUrl.trim(),
      signingSecret: signingSecret.trim(),
    });
  }

  return (
    <ChannelFormShell
      title="Webhook setup"
      description="Use a signed endpoint when you want your own service to receive every matched event."
      submitLabel="Create webhook channel"
      disabled={disabled}
      onSubmit={handleSubmit}
    >
      <Field id={nameId} label="Channel name">
        <Input
          id={nameId}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ops Webhook"
          required
        />
      </Field>

      <Field id={endpointId} label="Webhook URL">
        <Input
          id={endpointId}
          type="url"
          value={endpointUrl}
          onChange={(event) => setEndpointUrl(event.target.value)}
          placeholder="https://api.acme.xyz/hooks/notify-chain"
          required
        />
      </Field>

      <Field
        id={secretId}
        label="Signing secret"
        hint="Optional, but useful when the receiver verifies signatures."
      >
        <Input
          id={secretId}
          value={signingSecret}
          onChange={(event) => setSigningSecret(event.target.value)}
          placeholder="whsec_..."
        />
      </Field>
    </ChannelFormShell>
  );
}

function EmailForm({ disabled, onSubmit }: SharedFormProps & {
  onSubmit: (payload: EmailChannelRequest) => void;
}) {
  const [name, setName] = useState("On-call Email");
  const [emailAddress, setEmailAddress] = useState("");
  const [deliveryMode, setDeliveryMode] =
    useState<EmailChannelRequest["deliveryMode"]>("instant");
  const nameId = useId();
  const emailId = useId();
  const deliveryId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSubmit({
      type: "email",
      name: name.trim(),
      emailAddress: emailAddress.trim(),
      deliveryMode,
    });
  }

  return (
    <ChannelFormShell
      title="Email setup"
      description="Choose a delivery address for individual alerts or periodic digests."
      submitLabel="Create email channel"
      disabled={disabled}
      onSubmit={handleSubmit}
    >
      <Field id={nameId} label="Channel name">
        <Input
          id={nameId}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="On-call Email"
          required
        />
      </Field>

      <Field id={emailId} label="Notification email">
        <Input
          id={emailId}
          type="email"
          value={emailAddress}
          onChange={(event) => setEmailAddress(event.target.value)}
          placeholder="alerts@acme.xyz"
          required
        />
      </Field>

      <Field id={deliveryId} label="Delivery mode">
        <select
          id={deliveryId}
          className="border-input dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
          value={deliveryMode}
          onChange={(event) =>
            setDeliveryMode(event.target.value as EmailChannelRequest["deliveryMode"])
          }
        >
          <option value="instant">Instant</option>
          <option value="digest">Digest</option>
        </select>
      </Field>
    </ChannelFormShell>
  );
}

function TelegramForm({ disabled, onSubmit }: SharedFormProps & {
  onSubmit: (payload: TelegramChannelRequest) => void;
}) {
  const [name, setName] = useState("Trading Telegram");
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const nameId = useId();
  const tokenId = useId();
  const chatIdFieldId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSubmit({
      type: "telegram",
      name: name.trim(),
      botToken: botToken.trim(),
      chatId: chatId.trim(),
    });
  }

  return (
    <ChannelFormShell
      title="Telegram setup"
      description="Provide the bot credentials and the destination chat where alerts should be posted."
      submitLabel="Create Telegram channel"
      disabled={disabled}
      onSubmit={handleSubmit}
    >
      <Field id={nameId} label="Channel name">
        <Input
          id={nameId}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Trading Telegram"
          required
        />
      </Field>

      <Field id={tokenId} label="Bot token">
        <Input
          id={tokenId}
          value={botToken}
          onChange={(event) => setBotToken(event.target.value)}
          placeholder="123456789:AA..."
          required
        />
      </Field>

      <Field id={chatIdFieldId} label="Chat ID">
        <Input
          id={chatIdFieldId}
          value={chatId}
          onChange={(event) => setChatId(event.target.value)}
          placeholder="@acme_alerts or -1001234567890"
          required
        />
      </Field>
    </ChannelFormShell>
  );
}

function DiscordForm({ disabled, onSubmit }: SharedFormProps & {
  onSubmit: (payload: DiscordChannelRequest) => void;
}) {
  const [name, setName] = useState("Risk Discord");
  const [webhookUrl, setWebhookUrl] = useState("");
  const nameId = useId();
  const webhookId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSubmit({
      type: "discord",
      name: name.trim(),
      webhookUrl: webhookUrl.trim(),
    });
  }

  return (
    <ChannelFormShell
      title="Discord setup"
      description="Use a Discord webhook URL to route alerts into a specific channel or thread."
      submitLabel="Create Discord channel"
      disabled={disabled}
      onSubmit={handleSubmit}
    >
      <Field id={nameId} label="Channel name">
        <Input
          id={nameId}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Risk Discord"
          required
        />
      </Field>

      <Field id={webhookId} label="Webhook URL">
        <Input
          id={webhookId}
          type="url"
          value={webhookUrl}
          onChange={(event) => setWebhookUrl(event.target.value)}
          placeholder="https://discord.com/api/webhooks/..."
          required
        />
      </Field>
    </ChannelFormShell>
  );
}

export function IntegrationModal({
  open,
  integrationType,
  onClose,
  onChannelCreated,
}: IntegrationModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  const integrationLabel = channelLabels[integrationType];
  const integrationDescription = integrationDescriptions[integrationType];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lastActiveElementRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const animationFrameId = window.requestAnimationFrame(() => {
      const dialogElement = contentRef.current;

      if (!dialogElement) {
        return;
      }

      const focusableElements = getFocusableElements(dialogElement);
      const initialFocusTarget = focusableElements[0] ?? dialogElement;
      initialFocusTarget.focus();
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      window.cancelAnimationFrame(animationFrameId);
      lastActiveElementRef.current?.focus();
    };
  }, [open, integrationType]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      const dialogElement = contentRef.current;

      if (!dialogElement) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();

        if (!isSubmitting) {
          onClose();
        }

        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = getFocusableElements(dialogElement);

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialogElement.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (!(activeElement instanceof HTMLElement) || !dialogElement.contains(activeElement)) {
        event.preventDefault();

        if (event.shiftKey) {
          lastElement.focus();
        } else {
          firstElement.focus();
        }

        return;
      }

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSubmitting, onClose, open]);

  const form = useMemo(() => {
    const onSubmit = async (payload: CreateChannelRequest) => {
      setIsSubmitting(true);

      try {
        const response = await fetchJson<CreateChannelResponse>("/api/channels", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        onChannelCreated(response.channel);
        toast({
          title: `${integrationLabel} channel added`,
          description: `${response.channel.name} is ready to receive notifications.`,
        });
        onClose();
      } catch (error) {
        notifyError(error, { integrationType });
      } finally {
        setIsSubmitting(false);
      }
    };

    switch (integrationType) {
      case "webhook":
        return <WebhookForm disabled={isSubmitting} onSubmit={onSubmit} />;
      case "email":
        return <EmailForm disabled={isSubmitting} onSubmit={onSubmit} />;
      case "telegram":
        return <TelegramForm disabled={isSubmitting} onSubmit={onSubmit} />;
      case "discord":
        return <DiscordForm disabled={isSubmitting} onSubmit={onSubmit} />;
    }
  }, [integrationLabel, integrationType, isSubmitting, onChannelCreated, onClose]);

  if (!mounted || !open) {
    return null;
  }

  return createPortal(
    <div
      aria-hidden={!open}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        ref={contentRef}
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className={cn(
          "bg-card text-card-foreground relative w-full max-w-2xl rounded-2xl border border-border shadow-2xl outline-none"
        )}
        role="dialog"
        tabIndex={-1}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {integrationLabel}
            </p>
            <h2 className="text-xl font-semibold tracking-tight" id={titleId}>
              Add {integrationLabel} channel
            </h2>
            <p className="text-sm text-muted-foreground" id={descriptionId}>
              {integrationDescription}
            </p>
          </div>

          <Button
            aria-label="Close modal"
            disabled={isSubmitting}
            onClick={onClose}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="px-6 py-5">{form}</div>
      </div>
    </div>,
    document.body
  );
}
