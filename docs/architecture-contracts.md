# Architecture Contracts

## Purpose

Use this document when implementing or reviewing runtime boundaries. These contracts are the non-negotiable rules that keep Agent Arena from becoming a generic multi-agent workspace.

Do not use it as the full product spec; use [prd.md](prd.md). Do not use it for agent instructions; use [eve-agents.md](eve-agents.md). Do not use it for UI details; use [ui-react-bits.md](ui-react-bits.md).

## Contract 1: Battle Engine Owns Rules

The Battle Engine controls:

- State transitions.
- Round order.
- Team participation.
- Attack pairing.
- Retry and fallback policy.
- Score calculation.
- Champion selection.
- Replay event inclusion.
- Passport snapshot generation.

Agents do not control these.

## Contract 2: Agents Generate Content

Agents may generate:

- Brief text.
- Proposals.
- Attacks.
- Defenses.
- Judge comments.
- Artifact content.

Agents must return schema-valid data. Invalid output is repaired or replaced with fallback data.

## Contract 3: Event Log Is Evidence

Every critical action writes an event:

- `brief_created`
- `team_created`
- `proposal_created`
- `attack_created`
- `defense_created`
- `score_created`
- `champion_selected`
- `artifact_created`
- `replay_created`
- `passport_created`
- `error`

Replay and Passport are generated from events and normalized entities. They cannot invent unsupported claims.

## Contract 4: Scores Are Code

Judge agents can provide rubric scores and comments. Total score is calculated by code using the configured weights.

If judge prose conflicts with calculated totals, calculated totals win.

## Contract 5: Eve Is A Boundary

MVP may use mocked Eve invocation, but the directory and adapter shape must remain Eve-compatible:

```text
agents/{agent-name}/
  instructions.md
  agent.ts
  skills/
  tools/
```

The app should invoke agents through an adapter boundary so real Eve can replace mocks later.

## Contract 6: UI Reads State

UI must render battle state, events, scores, artifacts, and passports from product data. It must not hardcode winner logic into components.

Seeded fixtures are allowed for Phase 1, but they should match the runtime data shape.

Current MVP rule: UI-facing demo data must be adapted from `runDemoBattle()` or an API bundle. Do not reintroduce a second hand-written battle universe in presentation code.

## Contract 7: Safety First

MVP agents do not execute shell commands, write to user GitHub repos, or call dangerous external tools. Future sandbox/tool execution requires explicit approval gates and separate contracts.


## Contract 8: Frontend Renderer Architecture

Use server components for route composition and client components for interactive islands such as login, share, setup controls, replay controls, filters, and local state.
 
