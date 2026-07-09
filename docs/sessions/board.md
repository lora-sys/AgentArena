# AgentArena PM Board

> Living coordination board. PM (this orchestrator) updates after every meaningful change.
> Mirrors: https://github.com/lora-sys/AgentArena/issues

## Phase

**Sprint 0** — Foundation. Goal: Eve → Mastra migration baseline + design tokens + DB schema + first UI components.

Last update: 2026-07-09 (start of orchestrator session)

## GitHub issues (20)

| # | Title | Labels | Owner agent | Status |
|---|---|---|---|---|
| [#1](https://github.com/lora-sys/AgentArena/issues/1) | Define ArenaAgentRuntime interface contract | backend,sprint-0 | (pending spawn) | TODO |
| [#2](https://github.com/lora-sys/AgentArena/issues/2) | Implement Mastra runtime adapter | backend,sprint-0 | (pending spawn) | TODO |
| [#3](https://github.com/lora-sys/AgentArena/issues/3) | Add Drizzle ORM + Postgres schema | backend,sprint-0 | (pending spawn) | TODO |
| [#4](https://github.com/lora-sys/AgentArena/issues/4) | Wire event store to Postgres sink | backend,sprint-0 | — | TODO |
| [#5](https://github.com/lora-sys/AgentArena/issues/5) | Schema repair loop with retry budget | backend,sprint-0 | — | TODO |
| [#6](https://github.com/lora-sys/AgentArena/issues/6) | Bind /battle/[id]/live to SSE | frontend,sprint-0 | — | TODO |
| [#7](https://github.com/lora-sys/AgentArena/issues/7) | Bind /battle/[id]/result to API | frontend,sprint-0 | — | TODO |
| [#8](https://github.com/lora-sys/AgentArena/issues/8) | Bind /battle/[id]/replay to API | frontend,sprint-0 | — | TODO |
| [#9](https://github.com/lora-sys/AgentArena/issues/9) | Bind /agent/[id]/passport to API | frontend,sprint-0 | — | TODO |
| [#10](https://github.com/lora-sys/AgentArena/issues/10) | Migrate components/* to design tokens | ui,sprint-0 | (pending spawn) | TODO |
| [#11](https://github.com/lora-sys/AgentArena/issues/11) | Storybook + first 5 ui-kit components | ui,sprint-0 | — | TODO |
| [#12](https://github.com/lora-sys/AgentArena/issues/12) | Set up Vitest + Playwright + coverage | qa,sprint-0 | — | TODO |
| [#13](https://github.com/lora-sys/AgentArena/issues/13) | Port manual E2E to Playwright journeys | qa,sprint-0 | — | TODO |
| [#14](https://github.com/lora-sys/AgentArena/issues/14) | CI workflow | backend,sprint-0 | — | TODO |
| [#15](https://github.com/lora-sys/AgentArena/issues/15) | ArenaAgentRuntime contract tests | backend,sprint-0 | — | TODO |
| [#16](https://github.com/lora-sys/AgentArena/issues/16) | Example battle fixture | backend,sprint-0 | — | TODO |
| [#17](https://github.com/lora-sys/AgentArena/issues/17) | Lock 6 screenshot point baselines | ui,sprint-0 | — | TODO |
| [#18](https://github.com/lora-sys/AgentArena/issues/18) | Mock runtime for tests | backend,sprint-0 | — | TODO |
| [#19](https://github.com/lora-sys/AgentArena/issues/19) | Archive Eve-first docs | docs,sprint-0 | — | TODO |
| [#20](https://github.com/lora-sys/AgentArena/issues/20) | ADR 0001 Eve→Mastra | docs,sprint-0 | — | TODO |

## Active agents

(none yet — wave 1 spawning next)

## Wave plan

| Wave | Issues | Mode | Expected |
|---|---|---|---|
| 1 | #1 #3 #10 | parallel | runtime contract + db schema + tokens migration |
| 2 | #2 #5 #18 #4 | parallel after #1 #3 | mastra adapter + repair loop + mock + event store wire |
| 3 | #6 #7 #8 #9 #11 #12 #13 #14 #15 #16 #17 #19 #20 | after wave 2 | full UI bind + tests + CI + docs |

## Blockers

- None yet.

## Files for agents to read first (every agent)

1. `docs/CLAUDE.md` — workspace + invariants
2. `docs/agents.md` — role + handoff
3. `docs/design.md` — visual (UI agents)
4. `docs/test-guidelines.md` — testing (QA agents)
5. `docs/migration-v0.4.md` — current migration scope
6. The specific issue body on GitHub

## Agent output contract

Every agent MUST write `docs/sessions/agents/<agent-id>/status.md` with:

```
agent_id: <id>
issue: #<n>
title: <short>
status: running | done | blocked | needs-review
started: <iso>
last_update: <iso>
files_touched: <list>
evidence: <list of paths>
next_step: <one sentence>
blockers: <list or "none">
```