# Working roles and handoff

Backend owns `arena`, `lib/db`, `lib/runtime`, `agents`, and API persistence adapters. Frontend owns `apps/web` and presentation timing. Contracts shared by web and API live in `packages/contracts`. QA owns current-route journeys and release evidence.

Before changing a public contract, update the shared type and tests first. Frontend reveal timing may consume event order but must never redefine engine flow. Backend additions used only for presentation must fail softly and stay outside the critical battle path.

Handoffs should state changed modules, contract impact, tests run, fallback behavior, and any autonomous design decisions. Historical Sprint 0/1 orchestration is archived under `docs/archive/next-v0.4/agents-next.md`.
