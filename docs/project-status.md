# Project status

Updated: 2026-07-22.

## Complete

- Focused Vite/Hono workspace with four supported routes.
- Shared Battle event contract and deterministic 22-event Example Battle.
- Parallel same-round proposal reveal, serial round progression, HP reducer, hit feedback, typewriter copy, banners, commentary, evidence log, result, and replay views.
- Battle archive/dashboard and evidence-linked Agent Passport.
- Event-store-first API reads with a deterministic demo fallback.
- Desktop and 390px responsive layouts.
- Root typecheck, lint, unit tests, production build, and focused E2E commands.

## Preserved backend capability

The Battle Engine, schemas, database layer, Mastra runtime adapters, agent definitions, and fixtures remain intact. The visual rewrite did not change engine round order, state transitions, or scoring.

## Next product work

- Reconnect battle creation/start flows to the Hono surface when real Mastra + Postgres demo credentials are available.
- Expand current-route component tests and event-store integration coverage.
- Decide whether generated commentary should be introduced as a non-blocking sidecar; fixed commentary remains the safe default.

Historical Next.js implementation status is retained under `docs/archive/next-v0.4/` and dated QA/session records.
