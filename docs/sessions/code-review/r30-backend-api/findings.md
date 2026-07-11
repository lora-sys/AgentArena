# R30 Backend API

Date: 2026-07-10

## CRITICAL

1. **app/api/battles/[id]/start/route.ts:33-36** — Cancel is non-functional: AbortController is registered via `registerAbortController(id)` but the signal is never passed to `runBattleFromPayload`. The demo engine (`runDemoBattle`) has no abort/signal parameter. The cancel route at `app/api/battles/[id]/cancel/route.ts:18` calls `cancelCurrentBattle(id)` which aborts the controller, but since the engine never observes the signal, the synchronous demo battle runs to completion regardless. Client receives `"cancelling"` status but the battle continues uninterrupted — the cancel endpoint lies.

2. **app/api/battles/[id]/export/route.ts:30** — Real battle exports contain demo artifact content. When a battle IS found in the DB, the export correctly uses the real `safeTitle`/`safeIdea`/`row.status` in the header, but the "Battle Detail" body is built from `buildDemoExportMarkdown(id).split("---\n\n").slice(1).join("---\n\n")` which extracts the demo fixture's artifact body. A user exporting their own battle receives demo artifacts that have nothing to do with their input. The route should either generate artifacts from real DB data or clearly label the section as "demo fallback".

## Summary
- Criticals: 2