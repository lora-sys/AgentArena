# Eve-first docs (v0.3) — Archive

> Archived on 2026-07-10 as part of issues #19 and #20. These documents pre-date the v0.4 Mastra direction and are kept here for archaeology only. **Do not reference or link to these from current docs.**

## Why archived

PRD v0.4 §1.6 retires the Eve framework in favor of Mastra OSS (core only) as the agent runtime. The three documents in this directory were written when Agent Arena was Eve-first:

- **Eve directory model** — agents organized as directory trees (`instructions.md`, `agent.ts`, `skills/`, `tools/`, `sandbox/`, `connections/`, `subagents/`)
- **Eve agent execution** — agents invoked through the Eve runtime layer
- **Eve agent design patterns** — the `agents/<team>/agent.ts` skeleton

v0.4 replaces this with:

- **TypeScript monorepo** — agents live as code in `packages/agent-runtime`, not as Eve directories
- **Mastra adapter** — `packages/agent-runtime/src/mastra.ts` implements the `ArenaAgentRuntime` interface
- **Prompt-first design** — `agents/<team>/spec.yaml` + `agents/<team>/prompt.md` (kept from v0.3), but `agent.ts` replaced
- **Zod schema validation** — outputs must validate against `packages/schemas` before persistence

## What was moved

| Original path | Archived path | Content |
|---|---|---|
| `docs/prd.md` | `docs/archive/eve-v0.3/prd.md` | v0.2/v0.3 Eve-first PRD (30 sections, 48h hackathon framing) |
| `docs/eve-agents.md` | `docs/archive/eve-v0.3/eve-agents.md` | Eve agent directory patterns, 5 agent teams, shared tools |
| `docs/ui-react-bits.md` | `docs/archive/eve-v0.3/ui-react-bits.md` | UI guide based on Eve-era screenshot set and React Bits |

All moves used `git mv` to preserve history.

## What replaced them

| Old (archived) | New (v0.4) |
|---|---|
| `docs/prd.md` | `Agent_Arena_PRD_v0.4_Reputation_Arena_Product_Manual.md` (repo root) |
| `docs/eve-agents.md` | `agents/<team>/spec.yaml` + `agents/<team>/prompt.md` (directory structure) |
| `docs/ui-react-bits.md` | `docs/design.md` (visual language B — Linear x sports data viz) |
| `docs/CLAUDE.md` (eve version) | `docs/CLAUDE.md` (v0.4, current) |
| `docs/agents.md` (eve version) | `docs/agents.md` (v0.4, current) |
| Eve runtime layer | `packages/agent-runtime` with Mastra adapter |
| In-memory event store | `packages/event-store` (Postgres + Drizzle) |
| Vercel Workflows (future) | SSE endpoint in `apps/web/app/api/*` |

## How to read the archived docs

If you need historical context (why the v0.3 design was structured the way it was, what features were dropped or kept):

1. Skim `prd.md` for the v0.3 product framing and agent team definitions.
2. Skim `eve-agents.md` for the original 5-agent prompts and skill files. Some of the prompt patterns (Safe Builder = feasibility focus, Viral Designer = novelty focus, etc.) survive in v0.4 as `agents/<team>/spec.yaml` strategy sections.
3. Skim `ui-react-bits.md` for the v0.3 UI direction. This was superseded by the v0.4 visual direction B (see `docs/design.md`).

## Cross-references

- ADR 0001 — Eve to Mastra migration decision: `docs/adr/0001-eve-to-mastra.md`
- Migration plan: `docs/migration-v0.4.md`
- Current project fact sheet: `docs/CLAUDE.md`
