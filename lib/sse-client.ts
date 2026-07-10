import { assertBattleEvent, type BattleEvent } from "@/arena/schemas";
import { battleEventTypes } from "@/arena/schemas/types";

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
 * Parses a raw SSE message string into a structured envelope.
 * SSE format: lines like `event: <type>\ndata: <json>\n\n`
 */
const parseSseMessage = (
  raw: string,
): { eventType: string; data: string } | null => {
  const trimmed = raw.replace(/\r\n/g, "\n").trim();
  if (trimmed.length === 0) return null;

  const lines = trimmed.split("\n");
  let eventType = "message";
  const dataLines: string[] = [];

  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;
    const field = line.slice(0, colonIndex);
    let value = line.slice(colonIndex + 1);
    if (value.startsWith(" ")) value = value.slice(1);

    if (field === "event") {
      eventType = value;
    } else if (field === "data") {
      dataLines.push(value);
    }
  }

  const data = dataLines.join("\n");
  if (data.length === 0) return null;
  return { eventType, data };
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

    // Register a named listener for every known BattleEventType so the browser
    // dispatches typed SSE events (event: proposal_created\ndata: {...}) to the
    // correct handler instead of swallowing them in the default onmessage.
    const namedHandler = (e: MessageEvent<string>) => {
      handleMessage(e.data);
    };
    for (const eventType of battleEventTypes) {
      source.addEventListener(eventType, namedHandler);
    }

    // Fallback for messages without an event: field.
    source.onmessage = (e: MessageEvent<string>) => {
      handleMessage(e.data);
    };

    source.onerror = (e: Event) => {
      onConnectionError?.(e);
      if (source) {
        source.close();
        source = null;
      }
      if (!closed) {
        reconnectTimer = setTimeout(open, backoff);
        backoff = Math.min(backoff * 2, maxBackoffMs);
      }
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