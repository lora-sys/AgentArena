# Runtime Interface Contract

> Source: [PRD §18.5](../Agent_Arena_PRD_v0.4_Reputation_Arena_Product_Manual.md) | Implementation: `lib/runtime/contract.ts`

## Overview

`ArenaAgentRuntime` is the interface contract between the Battle Engine and any agent runtime implementation (Mastra adapter, mock, etc.). All input and output types are inferred from Zod schemas defined in `arena/schemas/types.ts` — no hand-written types.

## Methods

| Method | Input Schema | Output Schema | Purpose |
|---|---|---|---|
| `runProposal(spec, input)` | `ProposalSchema` | `ProposalSchema` | Generate a product proposal for a team |
| `runAttack(spec, input)` | `AttackSchema` | `AttackSchema` | Generate a cross-team attack on a rival proposal |
| `runDefense(spec, input)` | `DefenseSchema` | `DefenseSchema` | Generate a defense response to an attack |
| `runJudge(spec, input)` | `ScoreSchema` | `ScoreSchema` | Produce judge scores for a team |
| `runArtifact(spec, input)` | `ArtifactSchema` | `ArtifactSchema` | Generate a battle artifact (PRD, brief, etc.) |

All methods return `Promise<TOutput>` — runtime calls are asynchronous.

## AgentSpec

Every method receives an `AgentSpec` parameter identifying the agent configuration:

```ts
type AgentSpec = {
  agentId: string;       // required, e.g. "agent_safe_builder_v1"
  teamId?: string;       // optional, for team-scoped agents
  model?: string;        // optional override, e.g. "openai/gpt-5"
  maxRetries?: number;   // optional retry budget for schema repair
};
```

## Input/Output Types

All types are derived via `z.infer<typeof Schema>`:

- `ProposalInput = z.infer<typeof ProposalSchema>`
- `AttackInput = z.infer<typeof AttackSchema>`
- `DefenseInput = z.infer<typeof DefenseSchema>`
- `JudgeInput = z.infer<typeof ScoreSchema>`
- `ArtifactInput = z.infer<typeof ArtifactSchema>`

Output types are structurally identical to inputs for each method (the runtime produces a validated object matching the same schema).

## Error Model

Implementations should reject (not produce) outputs that fail Zod validation. The Battle Engine's schema repair loop (PRD §13.4) expects:

1. Runtime calls `schema.safeParse(output)` before returning.
2. On parse failure, the runtime should throw or return a rejected promise with validation issues.
3. The engine catches the error, increments the retry counter, and re-invokes the runtime up to `spec.maxRetries` times.
4. If retries are exhausted, the engine emits a `schema_validation_failed` event (PRD §13.4) and skips that round.

Implementations MUST NOT return unvalidated output. The contract guarantees inputs are already valid; outputs MUST be valid by construction.

## Usage Example

```ts
import type { ArenaAgentRuntime } from "@/lib/runtime/contract";

class MastraAdapter implements ArenaAgentRuntime {
  async runProposal(spec: AgentSpec, input: ProposalInput): Promise<ProposalOutput> {
    // delegate to Mastra Agent, validate output with ProposalSchema.safeParse
    const result = await this.mastraAgent.generate(input);
    return ProposalSchema.parse(result);
  }
  // ... other methods
}
```
