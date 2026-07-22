import { assertBattleEvent, type BattleEvent } from "@/arena/schemas";

/**
 * Typed callback invoked for every validated SSE event.
 */
export type SseEventCallback = (event: BattleEvent) => void;

/**
 * Callback invoked when a message payload fails Zod validation.
 * Receives the raw payload and the validation error for logging/reporting.
 */
export type SseValidationErrorCallback = (raw: unknown, error: Error) => void;

/**
 * Callback invoked on connection-level errors (network, abort, parse failure).
 */
export type SseConnectionErrorCallback = (error: Event | Error) => void;

/**
 * Options for the SSE client.
 */
export type SseClientOptions = {
  url: string;
  onEvent: SseEventCallback;
  onValidationError?: SseValidationErrorCallback;
  onConnectionError?: SseConnectionErrorCallback;
  /** Initial reconnect delay in ms. Default 500. */
  initialBackoffMs?: number;
  /** Maximum reconnect delay in ms. Default 5000. */
  maxBackoffMs?: number;
  /**
   * Maximum number of consecutive failed reconnect attempts before
   * giving up. Default 10. When exceeded, the client stops reconnecting
   * and emits a final `onConnectionError` callback (with the last error).
   * Set to Infinity for unlimited retries (legacy behavior).
   */
  maxRetries?: number;
  /** EventSource constructor override for testing. Defaults to globalThis.EventSource. */
  EventSourceCtor?: typeof EventSource;
};

/**
 * Handle returned by connect() — call close() to abort and prevent further reconnects.
 */
export type SseClientHandle = {
  close: () => void;
};

/**
 * Reusable SSE consumer for battle events.
 *
 * - Reconnects on disconnect with exponential backoff (capped at maxBackoffMs).
 * - Validates every payload via Zod (assertBattleEvent from arena/schemas).
 * - Calls typed callbacks for events, validation errors, and connection errors.
 *
 * Designed for browser-side use. EventSource is a global in modern browsers.
 */
export function connectSse(options: SseClientOptions): SseClientHandle {
  const {
    url,
    onEvent,
    onValidationError,
    onConnectionError,
    initialBackoffMs = 500,
    maxBackoffMs = 5000,
    maxRetries = 10,
    EventSourceCtor,
  } = options;

  const SourceCtor =
    EventSourceCtor ??
    (typeof globalThis !== "undefined" && "EventSource" in globalThis
      ? (globalThis.EventSource as typeof EventSource)
      : undefined);

  if (!SourceCtor) {
    throw new Error("EventSource is not available in this environment");
  }

  let closed = false;
  let source: EventSource | null = null;
  let backoff = initialBackoffMs;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let consecutiveFailures = 0;

  const handleMessage = (rawData: string) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawData);
    } catch {
      onValidationError?.(rawData, new Error("Invalid JSON in SSE payload"));
      return;
    }

    try {
      assertBattleEvent(parsed);
    } catch (error) {
      onValidationError?.(
        parsed,
        error instanceof Error ? error : new Error(String(error)),
      );
      return;
    }

    onEvent(parsed as BattleEvent);
  };

  const open = () => {
    if (closed) return;
    source = new SourceCtor(url);

    // Single onmessage handler — typed SSE events (`event: foo`) ALSO fire
    // onmessage per the SSE spec, and the eventType is already in the JSON
    // payload validated by assertBattleEvent. Registering per-type listeners
    // would double-dispatch every event.
    source.onmessage = (e: MessageEvent<string>) => {
      handleMessage(e.data);
    };

    // Reset backoff on successful (re)connection. Without this, the
    // backoff grows monotonically across reconnects and never resets
    // even if the connection has been healthy for a long time.
    source.onopen = () => {
      backoff = initialBackoffMs;
      consecutiveFailures = 0;
    };

    source.onerror = (e: Event) => {
      if (closed) return;
      onConnectionError?.(e);
      consecutiveFailures++;
      if (source) {
        source.close();
        source = null;
      }
      // Stop reconnecting after maxRetries consecutive failures.
      if (consecutiveFailures >= maxRetries) {
        return;
      }
      if (reconnectTimer !== null) {
        clearTimeout(reconnectTimer);
      }
      reconnectTimer = setTimeout(open, backoff);
      backoff = Math.min(backoff * 2, maxBackoffMs);
    };
  };

  open();

  return {
    close: () => {
      closed = true;
      if (reconnectTimer !== null) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      if (source) {
        source.close();
        source = null;
      }
    },
  };
}