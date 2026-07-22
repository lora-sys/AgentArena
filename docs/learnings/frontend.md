# Frontend learnings

## 2026-07-22 — Battle Arena visual playback

- The current SSE endpoint transports a completed event bundle; presentation timing must therefore be owned by a deterministic client playback queue.
- Grouping events by contiguous round and actor occurrence produces the desired concurrency: different teams reveal together, while repeated actions by one actor retain order.
- HP is safest as an event-derived projection. Settling accepted defenses only after their text reveal keeps animation timing separate from the authoritative Battle Engine.
- The static demo and dynamic route can share one player when data acquisition remains outside the player; static bundles and SSE arrays become equivalent inputs.
