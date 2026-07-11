# R25 Backend Runtime

Date: 2026-07-10

## CRITICAL

1. **lib/runtime/mastra.ts:302** — `callOpenAI(_spec: AgentSpec, messages)` ignores the `spec.model` field entirely. The method always uses `this.model` (constructor-level option) for every API call, despite `AgentSpec.model` being part of the public type contract (`contract.ts:28`). Every agent spec that specifies a different model silently gets the runtime's default model. This means per-agent model routing is completely broken — if a caller sets `spec.model = "gpt-5"` for one team and `"gpt-4"` for another, both teams receive `this.model`. The bug is hidden because (a) the parameter is prefixed with `_` making it look intentional, (b) no test asserts that the per-spec model reaches the API, and (c) in practice all teams currently use the same model. This is a latent contract violation that will silently misroute traffic if anyone relies on the type.

## Summary
- Criticals: 1