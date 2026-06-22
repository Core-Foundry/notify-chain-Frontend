# Notification Retry Strategy

This document explains how NotifyChain handles failed notification deliveries — what triggers a failure, how retries are attempted automatically, how the failure reason surfaces in the UI, and how manual retries work.

---

## How a notification moves through the system

When a matched event is dispatched, it passes through four stages. These are the same stages rendered in the **Timeline** page (`NotificationDelivery.stages`):

```
Created → Queued → Processing → Delivered | Failed
```

| Stage | What happens |
|---|---|
| Created | Event matches a rule; delivery record is created |
| Queued | Payload is added to the dispatch queue |
| Processing | Payload is signed and sent to the configured channel |
| Delivered / Failed | Terminal state — endpoint confirmed receipt, or all retries were exhausted |

A notification moves to **Failed** status only after all automatic retry attempts are exhausted.

---

## Automatic retries

The off-chain helper retries each failed delivery up to **3 times** before marking it failed. This limit is reflected directly in the failure reason messages stored on events:

- `"Webhook endpoint returned 503 Service Unavailable after 3 retries."`
- `"Connection refused after 3 retries"`

Retries use a fixed back-off between attempts. If the channel responds with a rate-limit error (HTTP 429), that is treated as a terminal failure at the point it occurs — it is not retried automatically, because re-attempting immediately would hit the same limit.

```
Attempt 1 ──► fail
    ↓ wait
Attempt 2 ──► fail
    ↓ wait
Attempt 3 ──► fail
    ↓
Status: failed  (failureReason set)
```

### Channel-specific failure reasons

The `failureReason` field on a `ChainEvent` records exactly why delivery stopped:

```ts
// From mock-data.ts — real payloads follow the same shape
failureReason: "Webhook endpoint returned 503 Service Unavailable after 3 retries."
failureReason: "Telegram API rate limit exceeded (429). Notification was not delivered."
failureReason: "Connection refused after 3 retries"
```

This string is shown verbatim in the **Retry notification** modal so users know what went wrong before deciding whether to retry.

---

## Manual retry

After automatic retries are exhausted, the dashboard surfaces a **Retry** button on any event with `status: "failed"`. Clicking it opens the retry modal (`RetryNotificationModal`).

### What the retry flow does

```
User clicks Retry
    ↓
Modal opens — shows event summary + failureReason
    ↓
User confirms → handleRetry() fires
    ↓
Request sent to off-chain helper (RETRY_LATENCY_MS ≈ 1400ms in dev)
    ↓
On success → retryNotification(event.id) called
    ↓
Store updates: status "delivered", failureReason cleared
    ↓
Event feed reflects the new status immediately
```

### Key behaviors

- The modal **cannot be dismissed** while a retry is in flight (`isRetrying === true` blocks `onOpenChange`).
- On success the store transitions the event: `status → 'delivered'`, `failureReason → undefined`. This is the `retryNotification` action in `dataSlice`.
- On failure the modal closes and the error is surfaced via `notifyError()`, which logs it through the central `logger` and shows a toast.

### Relevant code locations

| Concern | File |
|---|---|
| Retry modal UI | `frontend/src/components/dashboard/retry-notification-modal.tsx` |
| Store action | `frontend/src/store/slices/dataSlice.ts` — `retryNotification` |
| Error normalization | `frontend/src/lib/errors.ts` — `normalizeError` / `AppError` |
| Error toast + logging | `frontend/src/lib/notify.ts` — `notifyError` |
| Event type + `failureReason` | `frontend/src/lib/mock-data.ts` — `ChainEvent` |

---

## Error normalization

All errors from the helper API go through `normalizeError` before reaching the UI. This ensures:

- HTTP 429 → `"Too many requests. Please slow down and try again shortly."`
- HTTP 503 → `"The service is temporarily unavailable. Please try again."`
- Network failure → `"Network error. Check your connection and try again."`
- Unknown errors → generic safe message; original error kept under `cause` for logs only

`AppError` is used when you want a specific, user-facing message (e.g. a validation failure). Anything else collapses to a safe fallback — internal details never leak to the UI.

---

## OCR queue failure handling

The backend OCR queue (`OcrQueueService`) has its own pre-enqueue guard: before a job is accepted it checks `OcrWorkerPool.getHealthStatus()`. If `available === 0` it throws `ServiceUnavailableException` immediately rather than queuing work that cannot be processed.

Individual recognition jobs are protected by a **30-second timeout** in `OcrService.recognize()`:

```ts
const timeout = new Promise<never>((_, reject) =>
  setTimeout(() => reject(new OcrTimeoutError()), TIMEOUT_MS), // 30_000 ms
);
const result = await Promise.race([worker.recognize(imageBuffer), timeout]);
```

Timed-out jobs surface as `OcrTimeoutError` and the worker is released back to the pool regardless of the outcome (`finally` block).

---

## Summary of retry limits

| Scope | Limit | Behavior after limit |
|---|---|---|
| Automatic delivery retries | 3 attempts | Event marked `failed`, `failureReason` set |
| Rate-limited channel (429) | 0 retries | Immediate failure, reason recorded |
| Manual retry | No limit | User-triggered, one attempt per click |
| OCR recognition timeout | 30 seconds | `OcrTimeoutError`, worker released |
| OCR worker pool exhausted | N/A (pre-check) | `ServiceUnavailableException` before enqueue |
