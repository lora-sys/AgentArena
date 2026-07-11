# R27 Backend Runtime

Date: 2026-07-10

## CRITICAL

1. `lib/runtime/mastra.ts:302-309` — `MastraRuntime.callOpenAI(_spec, messages)` silently ignores `_spec.model`. The `AgentSpec.model` field is documented as a per-agent model override (see `lib/runtime/contract.ts:28`), but `callOpenAI` hardcodes `model: this.model` from the class-level constructor default. Result: any battle that configures different models per team (e.g. `team_safe_builder` with `"openai/gpt-5"`, `team_viral_designer` with `"openai/gpt-4-mini"`) gets all teams served by the same `this.model` — model selection is non-existent. `spec.maxRetries` on the same spec IS correctly wired through (line 246), proving the spec is intended to be honored but the model field was overlooked.

## Summary
- Criticals: 1
