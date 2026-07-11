# R14 Frontend Pages

Date: 2026-07-10

## CRITICAL

1. **app/agent/[id]/passport/page.tsx:112-138 (loadAgentPassport + line 273 not-found branch)** — `loadAgentPassport` always returns a non-null `{ passport, battle }` object (both the API-fetch path and `loadFromDemoBundle` return a valid pair). The `if (!result)` branch at line 272 that checks `id === "not-found"` is unreachable dead code. Any agent ID not present in `/api/battles/demo` will silently render the viral-designer demo passport via `loadFromDemoBundle` fallback rather than showing a "not found" state. For e.g. `/agent/foo-bar/passport`, the user sees another team's passport — a data leak / wrong-data rendering bug.

2. **app/agent/[id]/passport/page.tsx:117-119** — The fetch URL is hardcoded to `/api/battles/demo` regardless of the `agentId` URL param. The lookup at lines 125-130 attempts to find a matching passport within the demo response, but if no match is found (line 131) it calls `loadFromDemoBundle(agentId)` which constructs a synthetic passport from `demoBattle` data, not from real data for the requested agent. Combined with finding #1, any agent ID renders the viral-designer demo passport.

3. **app/agent/[id]/passport/page.tsx:290** — `isChampion` compares `battle.winnerTeamId === id.replace(/-/g, "_")`. `battle.winnerTeamId` is the UI ID (e.g. `"viral-designer"`); after `replace(/-/g, "_")` the right side becomes `"viral_designer"` — the comparison is always false. The second disjunct is dead. The first disjunct (`battle.winnerTeamId === id`) only works for the demo's winnerTeamId being a UI ID; if the API ever returned engine IDs this would silently mis-label every agent as "Participant".

## Summary
- Criticals: 3
