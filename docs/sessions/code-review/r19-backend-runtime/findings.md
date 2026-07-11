# R19 Backend Runtime

Date: 2026-07-10

## CRITICAL

1. **lib/sse-client.ts:119** — `onerror` handler fires `onConnectionError?.(e)` without checking `closed` first. After `handle.close()` sets `closed = true` and closes the source, any error event already queued in the browser event loop (server-side disconnect triggering an error) will still invoke the consumer's `onConnectionError` callback. The `if (!closed)` guard only prevents reconnect scheduling, not the callback invocation. Consumer gets a phantom error after explicitly closing the connection.

2. **lib/sse-client.ts:125** — `onerror` handler does not guard against duplicate reconnect timers. If `onerror` fires a second time (rare but possible in certain browser timing conditions before the source transitions to CLOSED state), the `if (source)` check passes `null` (set after first close), but the `if (!closed)` block schedules a *second* `setTimeout(open, ...)` that overwrites the `reconnectTimer` variable while the *first* timer is still live. Both timers fire `open()`, creating two `EventSource` instances — the first is orphaned (memory leak, no close called on it) and the second is tracked. With rapid disconnect/reconnect cycles this accumulates leaked EventSources.

## Summary
- Criticals: 2
