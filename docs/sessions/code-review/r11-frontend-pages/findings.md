# R11 Frontend Pages

Date: 2026-07-10

## CRITICAL

1. **app/api/battles/[id]/events/stream/route.ts:20 + lib/sse-client.ts:107 — SSE client never receives server-sent events.** The server sends every event with a named `event:` field (`` `event: ${event.eventType}\ndata: ${JSON.stringify(event)}\n` ``). Per the WHATWG EventSource spec, named events are dispatched to listeners registered via `addEventListener(eventName, ...)`, NOT to `onmessage`. The SSE client only registers `onmessage` (line 107: `source.onmessage = (e) => { handleMessage(e.data); }`). In a real browser, zero events will be delivered to the live battle page — the event timeline will always show "No events recorded yet." The unit test at `lib/sse-client.test.ts:36` falsely passes because the mock fires `onmessage` for typed events, contradicting the real browser behavior.

2. **app/battle/[id]/result/page.tsx:171 — Artifact download links all download the same file.** The result page links each artifact to `` `/api/battles/${battleId}/export?artifact=${artifact.type}` ``, implying per-artifact downloads. However, the export route at `app/api/battles/[id]/export/route.ts` ignores the `?artifact=` query parameter entirely and always returns the full battle markdown. Every artifact card downloads the identical file, defeating the purpose of listing individual artifacts.

3. **app/agent/[id]/passport/page.tsx:117 — Fetch targets non-existent API endpoint.** `loadAgentPassport` fetches `/api/battles/demo`, but no such route exists under `app/api/battles/demo/`. The fetch always 404s and the code silently falls through to the in-memory `loadFromDemoBundle()` fallback. Any non-demo agent passport will show hardcoded demo data — the dynamic passport API path is completely broken, silently degrading to static demo content.

## Summary
- Criticals: 3