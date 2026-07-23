# AGENTS.md

> Root routing file for all agents (human or AI) working on this repository. If you are an AI agent, read this first, then follow the links in the order below.

## What this is

Agent Arena is a reputation arena for AI agent teams. Three teams enter a structured Battle, generate proposals, attack each other, defend, get scored, and produce replayable evidence plus an Agent Passport Snapshot.

Product source of truth: [`Agent_Arena_PRD_v0.4_Reputation_Arena_Product_Manual.md`](Agent_Arena_PRD_v0.4_Reputation_Arena_Product_Manual.md) (PRD v0.4).

## Current Status

v0.4 visual rewrite (Vite + React + Hono, Postgres-capable). The focused four-route experience is demoable end-to-end with a deterministic fallback. Real Mastra + Postgres battle creation remains future integration work.

**What's new (v0.4 direction):**
- Replaced Eve framework with **Mastra OSS** (core only) as the AI runtime
- Backend is Postgres-backed (Drizzle ORM, 12 tables per PRD §19)
- 5 agents wired through the `ArenaAgentRuntime` contract with Zod validation and a 3-retry repair loop
- 4 supported routes with focused Playwright journeys; use the test command for the current count

## Read Order (v0.4)

1. **Project fact sheet** -- [`docs/CLAUDE.md`](docs/CLAUDE.md). Workspace layout, tech stack, package boundary rules, core invariants. **Read first.**
2. **This file** (`AGENTS.md`) -- you are here. Quick reference + command rules.
3. **Role orchestration** -- [`docs/agents.md`](docs/agents.md). Who owns what, handoff protocol, sprint plan.
4. **Visual language** -- [`docs/design.md`](docs/design.md). Tokens, components, six screenshot points (visual direction B -- Linear x sports data viz).
5. **Test guidelines** -- [`docs/test-guidelines.md`](docs/test-guidelines.md). Test pyramid, evidence format, coverage bars.
6. **Migration context** -- [`docs/migration-v0.4.md`](docs/migration-v0.4.md). Why v0.3 was abandoned, what survived, what was replaced.
7. **Architecture decisions** -- [`docs/adr/`](docs/adr/). Why each structural choice was made. Start with `0001-eve-to-mastra.md`.
8. **PRD section** -- read the specific PRD section linked from your ticket. PRD v0.4 is the source of truth for product behavior.

## Role Orchestration

Work is split by stable ownership boundaries; parallel work must keep file scopes disjoint.

Four roles:

| Role | Owns | Evidence received from |
|---|---|---|
| **Backend (雅座)** | `arena`, `lib/db`, `lib/runtime`, `agents`, `apps/api` | PRD, shared contracts |
| **UI/UX Designer** | `docs/design.md`, `prototype`, visual baselines | PRD §16, API payload shapes |
| **Frontend (老师)** | `apps/web/src/**`, replay presentation | UI/UX tokens, API event contracts |
| **QA** | `docs/test-guidelines.md`, `tests/e2e/**`, coverage reports | Backend fixtures, Frontend previews, UI/UX baselines |

Full details (daily flow, acceptance bar, custom skill prompts, inter-role contracts) are in [`docs/agents.md`](docs/agents.md).

## Do NOT read (archived)

The following docs pre-date the v0.4 Mastra direction and are kept for archaeology only. Do not link to them, do not follow their guidance:

- `docs/archive/eve-v0.3/prd.md` -- v0.3 Eve-first PRD
- `docs/archive/eve-v0.3/eve-agents.md` -- v0.3 Eve agent directory patterns
- `docs/archive/eve-v0.3/ui-react-bits.md` -- v0.3 UI guide

See [`docs/archive/eve-v0.3/README.md`](docs/archive/eve-v0.3/README.md) for the full archive index and what replaced each doc.
The removed Next.js presentation layer is archived under `docs/archive/next-v0.4/`; do not use those documents as current instructions.

## Core invariants (must not violate)

From `docs/CLAUDE.md` §7:

- **Battle Engine owns flow.** Model never decides round order, who attacks whom, or champion selection.
- **Every Score binds to ≥1 `evidenceEventId`.** No free-floating scores.
- **Passport Snapshot must show weaknesses**, not just strengths.
- **All event payloads pass Zod validation before persistence.** `schema_validation_failed` is itself an event.
- **Replay and Passport only read from event store.** Never from in-memory state. Page refresh must rebuild everything.
- **Artifact Writer may not invent facts.** Cross-check at generation time; cite source event IDs.

Any PR violating these is rejected.

## How to work in this repo

1. Read the linked PRD section and `docs/project-status.md`.
2. Use the location table in `docs/CLAUDE.md` to find the current module.
3. If you touch a public API, write the contract first in `docs/adr/NNNN-<topic>.md` and request review.
4. Write failing tests first (TDD). Coverage bar: ≥80% lines / ≥70% branches for engine, runtime, schemas, store.
5. Run `pnpm typecheck && pnpm lint && pnpm test` before committing.
6. Add a dated learning note only when the work produces a reusable engineering lesson.
7. Hand off with changed modules, contract impact, fallback behavior, and verification evidence.

## Quick reference

| What | Where |
|---|---|
| Battle round logic | `arena/engine/` |
| Agent output schemas | `arena/schemas/` |
| Database schema | `lib/db/schema.ts` |
| Pages and replay UI | `apps/web/src/` |
| Agent spec/prompt | `agents/<team>/spec.yaml` + `agents/<team>/prompt.md` |
| Design tokens | `apps/web/src/styles.css` |
| Example battle data | `examples/fixtures/` |
| Why a decision was made | `docs/adr/NNNN-*.md` |
| Current status | `docs/project-status.md` |
| Cross-role handoff | `docs/agents.md` |

## Development Commands

```bash
pnpm install          # install dependencies
pnpm dev              # Vite :5188 + Hono :8787
pnpm test             # vitest run (all unit tests)
pnpm test:coverage    # vitest run --coverage
pnpm e2e              # Playwright end-to-end journeys
pnpm build            # production build
pnpm typecheck        # tsc --noEmit across workspace
pnpm lint             # ESLint flat config
pnpm db:push          # apply Drizzle schema to dev DB
```

## Command Rules

- Prefix shell commands with `rtk`.
- Use `rg`/`rtk grep` for search before slower alternatives.
- Use `apply_patch` for manual file edits.
- Do not delete or revert user or parallel-agent changes.
- Do not run destructive git commands.

## Subagent Workflow

Prefer subagents for bounded parallel work, especially:

- Engine/runtime slice.
- Mastra agent slice.
- UI activation review.
- Documentation consistency review.
- Final audit.

## development rule
→ Plan
→ Code
→ Test
→ Playwright
→ Screenshot
→ Review
→ PR
→ Merge
开发时候
每一个流程，必须解决一个产品闭环
每个闭环必须经过浏览器和截图验证
不能只看代码说完成


Keep write scopes disjoint. Tell subagents they are not alone in the codebase and must not revert others' work. The main agent owns integration, final review, and docs/status synchronization.
