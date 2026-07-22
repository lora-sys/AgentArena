# Agent Arena fact sheet

Updated: 2026-07-22. This is the current architecture map. Dated QA, session, and archived Next.js documents are historical evidence only.

## Product surface

Agent Arena demonstrates evidence-based evaluation for three agent teams. The supported routes are `/`, `/battle/:id`, `/battles`, and `/agent/:id/passport`.

## Runtime architecture

| Layer | Current implementation |
|---|---|
| Web | Vite 6, React 19, React Router |
| API | Hono on Node, port 8787 |
| Shared contract | `packages/contracts` |
| Battle rules | deterministic engine in `arena/` |
| Persistence | Drizzle/Postgres through `lib/db` and event-store adapters |
| Agent runtime | Mastra-compatible adapters in `lib/runtime` and `agents/` |
| Demo fallback | deterministic fixtures in `examples/fixtures` and the web data adapter |

The web server runs on port 5188 and proxies `/api` to 8787. The API attempts event-store reads first. The Example Battle falls back to a verified fixture; a missing real battle returns an empty fallback rather than invented results.

## Boundaries

- Battle Engine owns round order, state transitions, scoring, and champion selection.
- Frontend replay only controls reveal timing. Events in the same round from different actors reveal together; rounds remain serial.
- Scores bind to evidence event IDs.
- Replay and Passport derive from persisted or verified fixture events.
- Passport shows weaknesses as well as strengths.
- Commentary is presentation-side and cannot block the battle.

## Where to look

| Need | Location |
|---|---|
| Route shell | `apps/web/src/App.tsx` |
| Battle UI/replay | `apps/web/src/components/` |
| Frontend data adapters | `apps/web/src/data/` |
| HTTP endpoints | `apps/api/src/app.ts` |
| Shared event types | `packages/contracts/src/` |
| Engine and schemas | `arena/` |
| Database | `lib/db/` |
| Agent runtime | `lib/runtime/`, `agents/` |
| Example source data | `examples/fixtures/` |
| Visual specification | `prototype/` |
| Current screenshots | `docs/visual-reference/current/` |

## Commands

`pnpm dev`, `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, and `pnpm e2e` are the supported root commands. Run `./scripts/doctor.sh` when paths or workspace setup change.
