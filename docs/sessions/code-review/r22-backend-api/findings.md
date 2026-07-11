# R22 Backend API

Date: 2026-07-10

## CRITICAL

1. **app/api/battles/route.ts:73-77** — POST `/api/battles` DB-unavailable path returns 500 instead of "falling through" to return the in-memory battle_id. When `DATABASE_URL` is not set or DB is unreachable, `getDb()` throws at step 3, the catch warns and falls through — but step 4 re-calls `getDb()` which throws again, the outer catch checks for `/unique|duplicate/i` (which does not match the "DATABASE_URL is not set" error), and the handler returns 500. The comment at line 75 says "fall through to returning the in-memory battle_id" but no such fall-through exists — there is no code path that returns a 201 without a successful DB insert. Any environment without a live DB (build, CI, demo mode) cannot create battles at all.

2. **app/api/battles/[id]/events/route.ts:20** — GET `/api/battles/[id]/events` always returns the hardcoded demo bundle regardless of the requested battle ID. The handler calls `runBattleFromPayload({}, id)` which internally calls `runDemoBattle()` — a static fixture runner with hardcoded teams, proposals, attacks, defenses, and scores. Any `btl_XXXXXXXX` ID returns the same event set with only the ID stamped on. Real battles stored in the DB are never read. The `status` route (line 53) correctly reads `findById` from the DB; the events/exports routes do not — inconsistent data sources across the same battle resource.

3. **app/api/battles/[id]/export/route.ts:14-16** — GET `/api/battles/[id]/export` always exports the hardcoded `demoBattle` fixture. The handler validates the battle ID, sanitizes it for the filename, but passes it only as a display label — the actual markdown body comes from `buildDemoExportMarkdown(id)` which reads `demoBattle` and `winner` from the static `lib/demo-data` module (see `lib/export-markdown.ts:3`). A user exporting their own real battle receives a markdown file claiming to be from their battle but containing the demo data — silently wrong content.

4. **app/api/battles/[id]/events/stream/route.ts:19-21** — SSE event format is broken. The code joins blocks with `\n` instead of the SSE-mandated `\n\n`. SSE protocol requires a blank line between event dispatches; without it, consecutive `event:`/`data:` lines from different events are concatenated by the parser, causing event loss or mis-parse. The output for two events is `event: foo\ndata: {...}\nevent: bar\ndata: {...}\n` — browsers and EventSource clients will treat this as a single malformed event.

5. **lib/api/guards.ts:322-325** — `registerAbortController` returns the wrong battle's AbortController on hash collision. When two different battle IDs collide (40-bit hash space is brute-forceable with ~2^20 effort), the second caller receives a controller that belongs to the first battle. Aborting battle A via the cancel endpoint will then abort battle B's in-flight OpenAI request. The owner-check returns the foreign controller rather than aborting it and creating a fresh one for the second caller.

6. **app/api/battles/[id]/cancel/route.ts:24-26** — Cancel route mislabels real battles as "demo_not_cancellable". When `cancelCurrentBattle` returns false (no controller in the in-memory registry), the handler returns `"status": "demo_not_cancellable"` unconditionally. Since `runDemoBattle` runs synchronously and clears its controller in `finally`, the cancel endpoint always hits this path even for valid real battles that simply have no in-memory controller (e.g. serverless cold start, multi-instance deploy). The client cannot distinguish "demo battle already finished" from "real battle has no cancellable in-flight process" — and there is no DB lookup to check whether the battle exists.

## Summary
- Criticals: 6