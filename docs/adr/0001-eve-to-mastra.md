# ADR 0001: Eve -> Mastra migration

- **Status**: Accepted
- **Date**: 2026-07-10
- **Deciders**: PM (AgentArena orchestrator), Backend (Yazoo), Frontend (Sensei)
- **Relates to**: PRD v0.4 §1.6 (Eve removal), §18.5 (Mastra adapter), Issues #1, #2, #5

## Context

Agent Arena v0.3 was designed around Eve by Vercel as the agent framework. The core assumption was that each Agent Team is an Eve directory (`agents/<team>/{instructions.md, agent.ts, skills/, tools/}`) and that the Battle Engine invokes Eve agents through the Eve runtime layer.

During Sprint 0 it became clear that the Eve-first direction had structural problems that blocked P0 delivery:

1. **Runtime lock-in** — Eve was still evolving and its execution semantics were not stable enough to trust for a demo-critical path. A breaking change in Eve between demo preparation and demo day was a real risk.
2. **Prompt/agent coupling** — The Eve `agent.ts` skeleton coupled prompt instructions to runtime config in a way that made unit testing painful. We wanted testable agents that validate against Zod schemas before any model call.
3. **No real interface boundary** — Eve agents were invoked directly. The Battle Engine could not be tested without a real Eve runtime, which made the engine not separately testable.
4. **Schema validation gap** — Eve did not enforce structured output at the framework level. Agent Arena requires every output (proposal, attack, defense, score) to pass Zod validation before persistence (PRD §11.3). This is a non-negotiable invariant.
5. **Hackathon framing was wrong** — v0.3 PRD was written for a 48-hour hackathon MVP. v0.4 reframes the product as a Reputation Arena with a longer P0 demo path. The Eve directory model was tightly coupled to the hackathon framing and did not generalize.

PRD v0.4 §1.6 explicitly retires Eve in favor of Mastra OSS (core only) as the agent runtime.

## Decision

We migrate from Eve to Mastra OSS (core only) with the following structural changes:

1. **ArenaAgentRuntime interface** — `packages/agent-runtime/src/contract.ts` defines the runtime interface (`generateProposal`, `generateAttack`, `generateDefense`, `generateScore`, `generateArtifact`). The Battle Engine depends only on this interface, not on any concrete implementation.
2. **Mastra adapter** — `packages/agent-runtime/src/mastra.ts` implements the interface using Mastra OSS core. All 5 agents (Safe Builder, Viral Designer, Infra Hacker, Judge Panel, Artifact Writer) run through this adapter.
3. **Mock runtime for tests** — `packages/agent-runtime/src/mock.ts` provides an in-memory implementation for unit and integration tests. No Mastra dependency in the test path.
4. **Zod schema validation before persistence** — Every model output passes through `packages/schemas` Zod validation. `schema_validation_failed` is itself an event type (PRD §13.4).
5. **Prompt files kept, agent.ts replaced** — `agents/<team>/spec.yaml` (role, strategy, model) and `agents/<team>/prompt.md` (instructions, skills) survive from v0.3. The `agent.ts` Eve skeleton is replaced by a Mastra adapter call.
6. **TypeScript monorepo** — Repos structure is `apps/web` + `packages/{battle-engine, agent-runtime, schemas, event-store, ui-kit, test-utils}`. No `arena/` directory from v0.3; logic lives in `packages/battle-engine`.

## Consequences

### Positive

- **Testable engine** — Battle Engine can be unit-tested with a mock runtime. No model call, no Eve dependency, no network.
- **Stable runtime contract** — `ArenaAgentRuntime` is our own interface. Mastra version bumps do not ripple into engine code.
- **Schema validation guaranteed** — Zod validation at the adapter boundary means invalid output cannot reach the event store.
- **Provider-agnostic** — Mastra wraps OpenAI, Anthropic, etc. behind one API. Future provider swap is a config change, not a code change.
- **Cleaner repo** — Monorepo with strict package boundaries (per `docs/CLAUDE.md` §4) replaces the flat `arena/` + `agents/` structure.

### Negative

- **Migration cost** — Existing v0.3 code in `arena/engine/` and `agents/*/agent.ts` must be rewritten. Roughly 10 files of battle logic survive with hardening; 5 agent skeletons need replacement.
- **Prompt content loss** — v0.3 prompt files used Eve-specific patterns (e.g., Eve subagent delegation). These need rewriting to fit Mastra's prompt structure.
- **Mastra API churn risk** — Mastra is still under active development. Pinning the version in `package.json` and wrapping behind our interface is the mitigation.
- **Postgres adds deployment complexity** — v0.4 needs a real database (Vercel deploy + Neon/Supabase). v0.3 ran on in-memory state.

### Neutral

- **Visual direction changes** — UI moves from Eve-era React Bits screenshots to visual direction B (Linear x sports data viz, per `docs/design.md`). The arena feel survives; the implementation is different.

## Alternatives considered

### A. Keep Eve

Status quo. Rejected for the reasons in Context items 1-4. Specifically: runtime stability risk, coupled prompt/agent structure that blocks clean unit testing, and the schema validation gap. Eve would have required us to build a Zod validation layer on top, effectively reimplementing the Mastra adapter boundary.

### B. Rewrite from scratch (no framework)

Use raw OpenAI/Anthropic SDK calls. Rejected. The Mastra adapter is thin (one file, ~200 lines) and gives us prompt management, streaming, and tool calling for free. Building from scratch would mean reimplementing these features with no P0 benefit.

### C. LangGraph

Considered as a possible replacement. Rejected because LangGraph is graph-oriented (DAG execution), which is a poor fit for the Battle Engine's sequential round model. Mastra is closer to our execution pattern (one agent, one structured output, one Zod validation).

### D. CrewAI

Considered. Rejected because CrewAI's multi-agent orchestration pattern conflicts with PRD §11.3 (Battle Engine owns flow). CrewAI's model is "let CrewAI decide who runs when," which is the opposite of our invariant.

### E. Custom in-house agent runtime

Considered. Rejected for the same reasons as B. The interface boundary is the value, not the implementation. One file of Mastra adapter is cheaper than maintaining a runtime.

## Migration scope

This ADR governs the v0.3 to v0.4 transition. Post-v0.4 changes to the runtime boundary (new provider, new validation layer) require their own ADR.
