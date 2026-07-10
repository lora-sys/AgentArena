# AGENTS.md

> Root routing file for all agents (human or AI) working on this repository. If you are an AI agent, read this first, then follow the links in the order below.

## What this is

Agent Arena is a reputation arena for AI agent teams. Three teams enter a structured Battle, generate proposals, attack each other, defend, get scored, and produce replayable evidence plus an Agent Passport Snapshot.

Product source of truth: [`Agent_Arena_PRD_v0.4_Reputation_Arena_Product_Manual.md`](Agent_Arena_PRD_v0.4_Reputation_Arena_Product_Manual.md) (PRD v0.4).

## Current Status

v0.4 (Mastra OSS, Postgres-backed). Sprint 0 in progress. Eve framework is retired — see [`docs/adr/0001-eve-to-mastra.md`](docs/adr/0001-eve-to-mastra.md).

## Read Order (v0.4)

1. **This file** (`AGENTS.md`) — you are here.
2. **Project fact sheet** — [`docs/CLAUDE.md`](docs/CLAUDE.md). Workspace layout, tech stack, package boundary rules, core invariants.
3. **Role orchestration** — [`docs/agents.md`](docs/agents.md). Who owns what, handoff protocol, sprint plan.
4. **Visual language** — [`docs/design.md`](docs/design.md). Tokens, components, six screenshot points (visual direction B — Linear x sports data viz).
5. **Test guidelines** — [`docs/test-guidelines.md`](docs/test-guidelines.md). Test pyramid, evidence format, coverage bars.
6. **Migration context** — [`docs/migration-v0.4.md`](docs/migration-v0.4.md). Why v0.3 was abandoned, what survived, what was replaced.
7. **Architecture decisions** — [`docs/adr/`](docs/adr/). Why each structural choice was made. Start with `0001-eve-to-mastra.md`.
8. **PRD section** — read the specific PRD section linked from your ticket. PRD v0.4 is the source of truth for product behavior.

## Do NOT read (archived)

The following docs pre-date the v0.4 Mastra direction and are kept for archaeology only. Do not link to them, do not follow their guidance:

- `docs/archive/eve-v0.3/prd.md` — v0.3 Eve-first PRD
- `docs/archive/eve-v0.3/eve-agents.md` — v0.3 Eve agent directory patterns
- `docs/archive/eve-v0.3/ui-react-bits.md` — v0.3 UI guide

See [`docs/archive/eve-v0.3/README.md`](docs/archive/eve-v0.3/README.md) for the full archive index and what replaced each doc.

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

1. Pull a ticket from the sprint board. Read the linked PRD section.
2. Read `docs/CLAUDE.md` §11 "Where to look first" to find the file you need to touch.
3. If you touch a public API, write the contract first in `docs/adr/NNNN-<topic>.md` and request review.
4. Write failing tests first (TDD). Coverage bar: ≥80% lines / ≥70% branches for engine, runtime, schemas, store.
5. Run `pnpm typecheck && pnpm lint && pnpm test` before committing.
6. Append a learning note to your role file in `docs/learnings/` (backend/frontend/ui/qa).
7. Hand off via PR description with evidence block (per `docs/agents.md` §3).

## Quick reference

| What | Where |
|---|---|
| Battle round logic | `packages/battle-engine/src/rounds/` |
| Agent output schemas | `packages/schemas/src/` |
| Database schema | `packages/event-store/src/schema.ts` |
| Pages and SSE | `apps/web/app/` |
| Agent spec/prompt | `agents/<team>/spec.yaml` + `agents/<team>/prompt.md` |
| Design tokens | `packages/ui-kit/src/tokens.css` |
| Example battle data | `examples/fixtures/` |
| Why a decision was made | `docs/adr/NNNN-*.md` |
| Sprint plan | `docs/agents.md` §4 |
| Cross-role handoff | `docs/agents.md` §3 |

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

Keep write scopes disjoint. Tell subagents they are not alone in the codebase and must not revert others' work. The main agent owns integration, final review, and docs/status synchronization.
