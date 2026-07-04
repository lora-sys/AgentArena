# Project Status

## Purpose

This file tracks the current phase, completed work, incomplete work, unresolved files/areas, planned resolution, and verification evidence. Update it after every meaningful phase step.

## Current Phase

Phase 4 entry: Phase 1 static shell, Phase 2 deterministic Battle Engine, and Phase 3 Eve directory skeleton are present. The current push is turning the seeded MVP into a demonstrable live-flow product with deterministic APIs, active UI controls, browser evidence, and clear remaining production gaps.

Last updated: 2026-07-04.

## Completed

| Area | Status | Evidence |
| --- | --- | --- |
| Product docs | Complete for planning baseline | `README.md`, `docs/prd.md`, `docs/mvp-spec.md`, `docs/development-plan.md`, `docs/acceptance-standards.md`. |
| Repo instructions | Complete baseline | `AGENTS.md` defines read order, phase sync protocol, subagent workflow, verification baseline. |
| Next.js app scaffold | Complete for MVP shell | `package.json`, `app/`, `components/`, `lib/`, `next.config.ts`, `tsconfig.json`. |
| Static MVP routes | Complete for seeded demo | `/`, `/battle/new`, `/battle/demo/live`, `/battle/demo/result`, `/battle/demo/replay`, `/teams`, `/battles`, `/agent/viral-designer/passport`. |
| Dynamic route aliases | Complete for route contract | `/battle/[id]/live`, `/battle/[id]/result`, `/battle/[id]/replay`, `/agent/[id]/passport`. |
| Deterministic Battle Engine | Complete for MVP deterministic path | `arena/engine/demo-battle.ts` generates brief, teams, proposals, attacks, defenses, scores, artifacts, replay, passports, and event log. |
| Evidence-linked Passport claims | Complete for MVP data contract | `arena/schemas/types.ts` has `PassportClaimEvidence`; `arena/engine/passport.ts` links claim, `attackId`, `defenseId`, accepted flag, attacker, defender. |
| Runtime data wiring | Complete for seeded UI | `lib/demo-data.ts` now derives UI view data from `runDemoBattle()` instead of maintaining a separate hand-written battle world. |
| Eve agent directory skeleton | Complete for Phase 3 foundation | `agents/safe-builder`, `agents/viral-designer`, `agents/infra-hacker`, `agents/judge-panel`, `agents/artifact-writer`. |
| UI activation | Complete for local MVP controls | `components/header-actions.tsx`, `components/battle-setup-form.tsx`, `components/replay-controls.tsx`, `components/battles-table.tsx`. |
| Create/start/read battle APIs | Complete for deterministic MVP | `/api/battles`, `/api/battles/[id]`, `/api/battles/[id]/start`. |
| Event APIs | Complete for deterministic MVP | `/api/battles/[id]/events`, `/api/battles/[id]/events/stream`. |
| Markdown export | Complete for seeded demo | `/api/battles/demo/export`, `/api/battles/[id]/export`. |
| Startup and doctor scripts | Complete for current scaffold | `scripts/start.sh`, `scripts/doctor.sh`. |
| Browser E2E evidence | Complete for current MVP pass | `artifacts/e2e/2026-07-04-browser/manifest.json` and 10 PNG screenshots. |
| Subagent audit attempt | Complete with partial useful finding | Paseo agent `AgentArena MVP audit` hit a usage-limit error; partial logs identified weak visible proposal/defense evidence, which has been fixed in Live and Replay. |

## MVP Requirement Coverage

| Requirement | Current Evidence | Status |
| --- | --- | --- |
| 1. User inputs complex idea | `components/battle-setup-form.tsx`; screenshot `01-setup-page.png` | Complete for local MVP |
| 2. System generates Battle Brief | `arena/engine/fixtures.ts`; screenshot `02-brief-preview.png` | Complete for deterministic MVP |
| 3. System starts 3 fixed Agent Teams | `arena/engine/fixtures.ts#createDemoTeams`; screenshots `05-live-battle.png`, `10-teams-navigation.png` | Complete for deterministic MVP |
| 4. Teams generate proposals | `arena/engine/fixtures.ts#createDemoProposals`; `runDemoBattle()` bundle; screenshots `05-live-battle.png`, `07-replay-share.png` | Complete for deterministic MVP |
| 5. Teams attack and rebut | `createDemoAttacks()`, `createDemoDefenses()`; screenshots `05-live-battle.png`, `07-replay-share.png`, `08-passport-evidence.png` | Complete for deterministic MVP |
| 6. Judge Panel scores rubric | `arena/engine/scoring.ts`; `createDemoScores()`; screenshot `06-result-artifacts.png` | Complete |
| 7. System chooses champion | `selectChampion()`; screenshot `06-result-artifacts.png` | Complete |
| 8. Final artifacts generated | `arena/engine/artifacts.ts`; screenshot `06-result-artifacts.png` | Complete |
| 9. Battle Replay generated | `arena/engine/replay.ts`; screenshot `07-replay-share.png` | Complete |
| 10. Agent Passport snapshot generated | `arena/engine/passport.ts`; screenshot `08-passport-evidence.png` | Complete |

## In Progress

| Area | Current State | Next Resolution |
| --- | --- | --- |
| Live page data binding | Dynamic routes render the seeded battle shape and generated battle ids route correctly. | Bind `/battle/[id]/live` to the API/event bundle instead of aliasing to the demo view. |
| Browser QA automation | `@browser` plugin E2E was executed and screenshots are retained. | Convert the manual plugin runbook into a repeatable CI-friendly check when a non-plugin browser runner is approved. |

## Not Complete

| Area | Missing | Proposed Resolution |
| --- | --- | --- |
| Real Eve invocation | Agent directories are static stubs and the engine uses deterministic fixtures. | Add an Eve adapter boundary that can swap fixtures for real Eve calls while preserving schema validation and fallback. |
| Database persistence | Battles are deterministic per request; no durable DB adapter exists. | Add a repository interface, then implement file/in-memory first, Drizzle/Supabase or Neon later. |
| Real auth persistence | Login is MVP-local browser state only. | Replace local mock user with a real auth provider after battle persistence exists. |
| True live streaming UI | SSE endpoint exists, but the Live page does not consume it yet. | Add polling/SSE client and event-driven stage updates. |
| CI | No CI workflow yet. | Add typecheck/build/doctor and screenshot artifact checks after the current file layout stabilizes. |

## Unresolved Files Or Areas

| File / Area | Issue | Resolution Plan |
| --- | --- | --- |
| `app/battle/[id]/*` | Dynamic routes are functional aliases, not ID-backed battle views. | Fetch `/api/battles/[id]` and map the bundle into page view models. |
| `components/arena-cards.tsx` | Some judge comments and replay copy remain seeded prose. | Derive comments/reasoning from engine score comments and replay segments. |
| `components/battles-table.tsx` | Battle history uses local rows instead of `/api/battles`. | Fetch deterministic API rows, then replace with persisted battle list. |
| `agents/*` | Eve-compatible skeleton exists, but there is no runtime adapter. | Add adapter interface and mock implementation before real Eve execution. |
| `scripts/` | Startup and doctor are scripted; browser plugin E2E is currently retained as evidence, not a shell-replayable command. | Add CI/browser runner once the preferred automation surface is stable outside the plugin session. |

## Verification Log

| Date | Command / Evidence | Result |
| --- | --- | --- |
| 2026-07-04 | `rtk npm run typecheck` | Passed. |
| 2026-07-04 | `rtk npm run build` | Passed; route manifest includes `/api/battles`, `/api/battles/[id]`, `/api/battles/[id]/events`, `/api/battles/[id]/events/stream`, `/api/battles/[id]/start`, dynamic battle pages, and static demo pages. |
| 2026-07-04 | `rtk ./scripts/doctor.sh` | Passed. |
| 2026-07-04 | `@browser` plugin E2E: `artifacts/e2e/2026-07-04-browser/manifest.json` | Passed. Screenshots cover setup, brief preview, login, share, live battle with proposals/attacks/defenses, result/artifacts, replay with proposals/defenses/share, passport evidence, battles filter, teams navigation. |

## Next Planned Slice

1. Bind dynamic battle pages to `/api/battles/[id]`.
2. Add client-side polling/SSE consumption for the Live page.
3. Add an Eve adapter interface with deterministic mock implementation.
4. Relaunch a read-only audit subagent when usage is available.
5. Add CI and a repeatable browser evidence command once the browser runner is selected for automation outside the plugin session.
