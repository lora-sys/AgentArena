# R28 Backend API

Date: 2026-07-10

## CRITICAL

1. `app/api/battles/[id]/export/route.ts:30` — Real-battle export serves demo data. When a battle is found in the DB, the export uses the real `title`, `idea`, and `status` from the DB row, but the "Battle Detail" section is built from `buildDemoExportMarkdown(id)`, which always returns the hardcoded demo event log, artifacts, and winner from `demo-data.ts`. Every real battle export contains fabricated demo content as if it were real battle data.

2. `app/api/battles/[id]/cancel/route.ts:14` — Cancel route rejects "demo" with 400, making the "demo_not_cancellable" status (line 27) dead code. The `validateBattleId(id)` check rejects "demo" because it does not match the `btl_*` format, returning 400 before the `id === "demo"` branch at line 27 can execute. All other dynamic routes (get, events/stream, status) exempt "demo" from format validation; the cancel route is the only one that does not.

3. `app/api/battles/[id]/events/route.ts:12` — Events route rejects "demo" with 400, inconsistent with all sibling routes. The `validateBattleId(id)` check does not include the `id !== "demo"` exemption that exists in `events/stream/route.ts:14`, `route.ts:18` (get), and `status/route.ts:47`. A client polling `GET /api/battles/demo/events` receives 400 instead of the demo events.

## Summary
- Criticals: 3
