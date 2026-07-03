# Agent Arena Development Plan

## Purpose

This document defines the phased implementation plan for Agent Arena. Use it when deciding what to build next, what to defer, and how to keep the MVP small enough to ship.

Do not use this document for detailed schemas; use [mvp-spec.md](mvp-spec.md). Do not use it for visual implementation detail; use [ui-react-bits.md](ui-react-bits.md). Do not use it for runtime invariants; use [architecture-contracts.md](architecture-contracts.md).

## Phase 0: Repo And Product Grounding

Goal: make the project understandable and safe to start.

Deliverables:

- Root README.
- Product docs linked from README.
- Startup and doctor scripts.
- Architecture contracts.
- Acceptance standards.
- Review skill guidance.

Exit gate:

- A new agent can read the README and find the right source doc in under 2 minutes.
- `./scripts/doctor.sh` reports the repo state without crashing.

## Phase 1: Static MVP Shell

Goal: turn `ui/` screenshots into a navigable Next.js shell with seeded data.

Deliverables:

- Next.js + TypeScript app.
- Tailwind CSS.
- Lucide icons.
- React Bits source components copied only where needed.
- Pages: `/`, `/battle/new`, `/battle/demo/live`, `/battle/demo/result`, `/battle/demo/replay`, `/agent/viral-designer/passport`, `/teams`, `/battles`.
- Seeded battle data matching the current screenshots.

Exit gate:

- Every screenshot moment exists as a route.
- No route depends on live model calls.
- Demo can be clicked through offline.

## Phase 2: Deterministic Battle Engine

Goal: implement the product rules before adding real model autonomy.

Deliverables:

- Battle state machine.
- Team registry.
- Round runner.
- Event store interface with in-memory adapter.
- Score calculator.
- Replay generator.
- Passport snapshot generator.
- Markdown export generator.

Exit gate:

- One seeded battle can be generated entirely from deterministic fixtures.
- Score totals are calculated by code, not model prose.
- Replay and Passport are derived from events.

## Phase 3: Mock Eve Agent Layer

Goal: preserve Eve directory shape while keeping hackathon reliability.

Deliverables:

- `agents/safe-builder`, `agents/viral-designer`, `agents/infra-hacker`, `agents/judge-panel`, `agents/artifact-writer`.
- `instructions.md`, `agent.ts`, `skills/`, `tools/` shape.
- Mock invocation adapter that returns schema-valid fixtures.
- Repair/fallback path for invalid output.

Exit gate:

- Battle Engine invokes agents through an adapter boundary.
- The UI cannot tell whether outputs came from mock agents or real Eve.
- All P0 schemas validate.

## Phase 4: Live Battle MVP

Goal: run one real battle with safe fallbacks.

Deliverables:

- Battle create/start API.
- Event streaming or polling.
- Schema validation and retry once.
- Seeded fallback battle.
- Export Markdown.

Exit gate:

- Live battle completes 3 times in a row.
- Single battle time is 2 to 5 minutes.
- Failed model output does not crash the demo.

## Phase 5: MVP Polish And Demo Readiness

Goal: make the product memorable and judge-readable.

Deliverables:

- Six screenshot moments.
- Champion reveal.
- Replay share surface.
- Agent Passport snapshot.
- UI QA on desktop and mobile.
- Demo script aligned with PRD.

Exit gate:

- A judge understands the difference from a generic multi-agent workspace in 30 seconds.
- The demo has a seeded fallback path.
- Acceptance standards pass.

## Deferred Until After MVP

- Custom agent team editor.
- Real marketplace.
- External A2A federation.
- Real MCP tool marketplace.
- Shell execution by agents.
- Writing to user GitHub repos.
- Multi-user permissions.
- Long-term leaderboard.
