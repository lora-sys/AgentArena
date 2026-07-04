# mvp-spec.md

# Agent Arena MVP Spec

## 1. Product Name

Agent Arena

## 2. Product Positioning

Agent Arena is an Eve-powered battle arena where AI agent teams compete on real tasks, critique each other, get judged, and build reputation through replayable evidence.

中文定位：

> 一个基于 Eve 构建的 Agent 竞技场，让多个 Agent Team 在真实任务里比赛、互相质疑、接受评分，并沉淀 Battle Replay 与 Agent Passport。

---

## 3. Core Product Belief

Do not trust an agent because it says it can do the job.

Make it prove itself.

中文：

> 不要相信 Agent 的自我介绍，让它上场。

---

## 4. MVP Goal

Build a hackathon-ready demo where a user enters a messy product idea, then three Eve-powered Agent Teams compete to produce the best hackathon project direction.

The system must generate:

* Battle Brief
* Three competing proposals
* Cross attacks
* Defenses
* Judge Scoreboard
* Champion Plan
* PRD
* Architecture
* Demo Script
* Pitch Outline
* TODO
* Battle Replay
* Agent Passport Snapshot

---

## 5. Target User

Primary user:

Hackathon builders who have a vague idea and need to quickly turn it into a strong, demoable product.

Secondary user:

Indie hackers, AI product builders, and agent developers who want to compare ideas or Agent Teams.

---

## 6. Main User Flow

```text
User enters messy idea
  ↓
Battle Engine generates Battle Brief
  ↓
Battle Engine starts three Eve Agent Teams
  ↓
Safe Builder proposes feasible plan
  ↓
Viral Designer proposes memorable plan
  ↓
Infra Hacker proposes technical plan
  ↓
Teams attack each other
  ↓
Teams defend or revise
  ↓
Judge Panel scores all teams
  ↓
Battle Engine selects champion
  ↓
Artifact Writer generates deliverables
  ↓
Replay and Passport are generated from event log
```

---

## 7. MVP Battle Input

### Required input

```text
idea: string
```

Example:

```text
我想做一个基于 Agent 元宇宙的黑客松项目，但不能只是普通 multi-agent workspace。需要有趣、有技术亮点、有长期愿景。
```

### Optional input

```ts
type BattleSettings = {
  battleType: 'hackathon' | 'startup' | 'research' | 'coding'
  timeLimit: '24h' | '48h' | '7d'
  preference: 'balanced' | 'viral' | 'technical' | 'safe'
  outputTargets: Array<'product_brief' | 'prd' | 'architecture' | 'demo_script' | 'pitch_outline' | 'todo'>
}
```

### MVP defaults

```ts
const defaultBattleSettings = {
  battleType: 'hackathon',
  timeLimit: '48h',
  preference: 'balanced',
  outputTargets: ['product_brief', 'prd', 'architecture', 'demo_script', 'pitch_outline', 'todo']
}
```

---

## 8. MVP Agent Teams

### Team A: Safe Builder

Strategy:

> Make the safest, most feasible, most buildable hackathon project.

Focus:

* Feasibility
* Scope control
* Stable demo
* Clear engineering tasks
* 48-hour execution

---

### Team B: Viral Designer

Strategy:

> Make the most memorable, screenshot-worthy, story-driven hackathon project.

Focus:

* Novelty
* Demo wow
* Shareability
* Product hook
* Judge memory

---

### Team C: Infra Hacker

Strategy:

> Make the most technically deep and future-facing hackathon project.

Focus:

* Agent runtime
* Protocol readiness
* Evidence chain
* Reputation model
* Long-term network potential

---

### Judge Panel

Strategy:

> Simulate hackathon judges, market judges, and technical judges.

Focus:

* Novelty
* Feasibility
* Demo wow
* Technical depth
* User value
* Long-term potential

---

### Artifact Writer

Strategy:

> Convert the champion proposal into useful project artifacts.

Outputs:

* product-brief.md
* prd.md
* architecture.md
* demo-script.md
* pitch-outline.md
* todo.md

---

## 9. Battle Rounds

### Round 0: Briefing

Input:

* user idea
* battle settings

Output:

```ts
type BattleBrief = {
  goal: string
  constraints: string[]
  targetUser: string
  successCriteria: string[]
  requiredArtifacts: string[]
}
```

Event:

```text
brief_created
```

---

### Round 1: Proposal

Each Team outputs one proposal.

```ts
type Proposal = {
  teamId: string
  productName: string
  oneLiner: string
  targetUser: string
  problem: string
  solution: string
  mvpFeatures: string[]
  demoPlan: string
  technicalHighlight: string
  risks: string[]
  whyThisCanWin: string
}
```

Events:

```text
proposal_created
```

---

### Round 2: Cross Attack

Each Team attacks the other two Teams.

```ts
type Attack = {
  id: string
  attackerTeamId: string
  targetTeamId: string
  attackType:
    | 'too_generic'
    | 'too_complex'
    | 'weak_demo'
    | 'weak_market'
    | 'weak_technical_depth'
    | 'no_viral_hook'
    | 'poor_feasibility'
    | 'unclear_user'
    | 'weak_long_term_vision'
  claim: string
  evidence: string
  severity: 'low' | 'medium' | 'high'
  suggestedFix: string
}
```

Events:

```text
attack_created
```

---

### Round 3: Defense

Each Team responds to attacks.

```ts
type Defense = {
  id: string
  attackId: string
  teamId: string
  targetTeamId: string
  responseToAttack: string
  acceptedAttack: boolean
  revision: string
}
```

`attackId` is required for evidence traceability. Passport accepted/rejected claims must link back to a specific attack and defense, not only to matching text.

Events:

```text
defense_created
```

---

### Round 4: Judging

Judge Panel scores all teams.

```ts
type Score = {
  teamId: string
  scores: {
    novelty: number
    feasibility: number
    demoWow: number
    technicalDepth: number
    userValue: number
    longTermPotential: number
  }
  judgeComments: string[]
  winningReason?: string
  losingReason?: string
}
```

Scoring weights:

```ts
const scoringWeights = {
  novelty: 0.20,
  feasibility: 0.20,
  demoWow: 0.20,
  technicalDepth: 0.15,
  userValue: 0.15,
  longTermPotential: 0.10
}
```

Total score is calculated by system code, not by the model.

Events:

```text
score_created
champion_selected
```

---

### Round 5: Artifact Generation

Artifact Writer generates deliverables from champion proposal.

```ts
type Artifact = {
  id: string
  battleId: string
  type:
    | 'product_brief'
    | 'prd'
    | 'architecture'
    | 'demo_script'
    | 'pitch_outline'
    | 'todo'
  title: string
  content: string
}
```

Events:

```text
artifact_created
```

---

### Round 6: Replay + Passport

Replay and Passport are generated from event log.

Important:

The Replay must be based on battle events.

The Passport must be based on proposals, attacks, defenses, scores, and accepted claims.

Events:

```text
replay_created
passport_created
```

---

## 10. Battle Engine

The Battle Engine is the product core.

Eve handles agents.

Battle Engine handles rules.

### Responsibilities

```text
- battle state machine
- round scheduling
- Eve agent invocation
- schema validation
- retry and repair
- event logging
- score calculation
- champion selection
- replay generation
- passport update
- artifact packaging
```

### Non-negotiable principle

Do not let the model decide the battle flow.

The model generates content.

The Battle Engine controls the game.

---

## 11. Battle State Machine

```ts
type BattleStatus =
  | 'idle'
  | 'briefing'
  | 'team_generation'
  | 'proposal_round'
  | 'cross_attack_round'
  | 'defense_round'
  | 'judging_round'
  | 'artifact_generation'
  | 'replay_generation'
  | 'completed'
  | 'failed'
  | 'retrying'
  | 'cancelled'
```

Flow:

```text
idle
  → briefing
  → team_generation
  → proposal_round
  → cross_attack_round
  → defense_round
  → judging_round
  → artifact_generation
  → replay_generation
  → completed
```

---

## 12. Core Data Models

### Battle

```ts
type Battle = {
  id: string
  title: string
  idea: string
  type: 'hackathon' | 'startup' | 'research' | 'coding'
  status: BattleStatus
  constraints: {
    timeLimit: string
    outputTargets: string[]
    preference?: string
  }
  winnerTeamId?: string
  createdAt: string
  updatedAt: string
}
```

---

### Team

```ts
type Team = {
  id: string
  battleId: string
  name: string
  strategy: string
  riskProfile: 'safe' | 'balanced' | 'aggressive'
  eveAgentDirectory: string
  score?: number
}
```

---

### EveAgentDefinition

```ts
type EveAgentDefinition = {
  id: string
  name: string
  role: string
  teamId?: string
  directoryPath: string
  instructionsPath: string
  skills: string[]
  tools: string[]
  model?: string
}
```

---

### BattleEvent

```ts
type BattleEvent = {
  id: string
  battleId: string
  round: string
  actorType: 'system' | 'team' | 'agent' | 'judge'
  actorId?: string
  targetId?: string
  eventType:
    | 'brief_created'
    | 'team_created'
    | 'proposal_created'
    | 'attack_created'
    | 'defense_created'
    | 'score_created'
    | 'champion_selected'
    | 'artifact_created'
    | 'replay_created'
    | 'passport_created'
    | 'error'
  title: string
  content: string
  rawPayload?: unknown
  createdAt: string
}
```

---

### AgentPassport

```ts
type AgentPassport = {
  id: string
  agentId: string
  battleId: string
  agentName: string
  role: string
  directoryPath: string
  contributionSummary: string
  acceptedClaims: PassportClaimEvidence[]
  rejectedClaims: PassportClaimEvidence[]
  strengths: string[]
  weaknesses: string[]
  contributionScore: number
}

type PassportClaimEvidence = {
  claim: string
  attackId: string
  defenseId: string
  acceptedAttack: boolean
  attackerTeamId: string
  defenderTeamId: string
}
```

---

## 13. API Routes

### Create Battle

```http
POST /api/battles
```

Request:

```json
{
  "idea": "string",
  "battleType": "hackathon",
  "timeLimit": "48h",
  "preference": "balanced",
  "outputTargets": ["product_brief", "prd", "architecture", "demo_script", "pitch_outline", "todo"]
}
```

Response:

```json
{
  "battleId": "battle_001",
  "status": "completed",
  "battle": {},
  "bundle": {}
}
```

MVP note: the current deterministic API returns a completed seeded bundle so the demo is reliable before real Eve invocation and persistence are added.

---

### Start Battle

```http
POST /api/battles/:id/start
```

Behavior:

* starts Battle Engine
* invokes Eve Agents
* writes event log
* returns `battleId`, `status`, battle summary, and completed bundle

---

### Stream Battle Events

```http
GET /api/battles/:id/events/stream
```

Behavior:

* streams battle events
* used by Arena Live page

The deterministic MVP also exposes:

```http
GET /api/battles/:id/events
```

This returns the event array as JSON for polling or debugging.

---

### Get Battle

```http
GET /api/battles/:id
```

Returns:

* battle
* teams
* proposals
* attacks
* defenses
* scores
* artifacts
* events
* passports

---

### Export Markdown

```http
GET /api/battles/:id/export
```

Returns:

* combined markdown package

---

## 14. Frontend Pages

### Home Page

Route:

```text
/
```

Required sections:

* Hero
* Problem
* How it works
* Example battle
* Agent Passport preview
* Long-term vision
* CTA

---

### Battle Setup Page

Route:

```text
/battle/new
```

Components:

* idea textarea
* battle type select
* time limit select
* preference select
* output targets
* start button

---

### Arena Live Page

Route:

```text
/battle/:id/live
```

Layout:

```text
Left: Eve Agent Teams
Center: Battle Stage
Right: Trace + Score Updates
```

Components:

* TeamCard
* RoundIndicator
* ProposalCard
* AttackCard
* DefenseCard
* JudgeCard
* Scoreboard
* EventTimeline

---

### Result Page

Route:

```text
/battle/:id/result
```

Components:

* ChampionCard
* Scoreboard
* WinningReason
* LosingReasons
* ArtifactViewer
* ExportButton
* ReplayLink

---

### Replay Page

Route:

```text
/battle/:id/replay
```

Components:

* BattleSummary
* TeamEntrance
* ProposalComparison
* AttackTimeline
* DefenseTimeline
* JudgeScoreboard
* ChampionReveal
* ArtifactViewer
* PassportSnapshot

---

### Agent Passport Page

Route:

```text
/agent/:id/passport
```

Components:

* AgentProfile
* EveDirectoryPath
* SkillsList
* ToolsList
* ContributionSummary
* AcceptedClaims
* RejectedClaims
* Strengths
* Weaknesses
* ContributionScore

---

## 15. UI Requirements

The product must not look like a generic dashboard.

It should feel like:

* AI debate arena
* hackathon war room
* agent tournament
* tactical product lab

### Screenshot-worthy moments

1. Three Eve Agent Teams entering battle
2. Proposal comparison
3. Cross Attack card
4. Judge Scoreboard
5. Champion Reveal
6. Battle Replay
7. Agent Passport

### React Bits Usage

React Bits is approved for MVP UI polish, but only as copied local source components.

Use React Bits for:

* animated round progress
* active team cards
* score reveal
* replay/event list transitions
* champion reveal
* passport metric polish

Do not use React Bits for:

* core forms
* tables
* validation
* Battle Engine logic
* remote runtime dependencies
* heavy visual effects before the seeded MVP shell works

The visual source of truth is the `ui/` screenshot directory. Detailed UI guidance lives in [ui-react-bits.md](ui-react-bits.md).

---

## 16. Tech Stack

### Core

```text
Next.js
TypeScript
Eve
Vercel
Supabase or Neon Postgres
Drizzle or Prisma
Tailwind CSS
React Bits, copied locally where useful
lucide-react icons
```

### Agent Layer

```text
Eve agent directories
instructions.md
agent.ts
skills/
tools/
```

### Product Layer

```text
Custom Battle Engine
Event Store
Score Calculator
Replay Generator
Passport Updater
Artifact Packager
```

### Future Layer

```text
Eve sandbox
Eve connections
MCP connections
A2A-ready Agent Card
Vercel Workflows
Local Runner
```

---

## 17. Recommended Project Structure

```text
agent-arena/
  app/
    page.tsx
    battle/
      new/page.tsx
      [id]/
        live/page.tsx
        result/page.tsx
        replay/page.tsx
    agent/
      [id]/
        passport/page.tsx

  arena/
    engine/
      battle-state.ts
      round-runner.ts
      team-registry.ts
      scoring.ts
      replay.ts
      passport.ts
      artifacts.ts

    schemas/
      battle.schema.ts
      proposal.schema.ts
      attack.schema.ts
      defense.schema.ts
      score.schema.ts
      artifact.schema.ts
      passport.schema.ts

    events/
      event-store.ts
      event-types.ts

  agents/
    safe-builder/
      instructions.md
      agent.ts
      skills/
        mvp-scoping.md
        feasibility-check.md
        demo-stability.md
      tools/
        format_proposal.ts

    viral-designer/
      instructions.md
      agent.ts
      skills/
        novelty-detection.md
        viral-hook.md
        story-framing.md
        share-loop.md
      tools/
        format_proposal.ts

    infra-hacker/
      instructions.md
      agent.ts
      skills/
        protocol-design.md
        runtime-design.md
        evidence-chain.md
        future-architecture.md
      tools/
        format_proposal.ts

    judge-panel/
      instructions.md
      agent.ts
      skills/
        hackathon-judge.md
        market-judge.md
        technical-judge.md
        scoring-rubric.md
      tools/
        calculate_score.ts

    artifact-writer/
      instructions.md
      agent.ts
      skills/
        prd-writing.md
        architecture-writing.md
        demo-script-writing.md
        pitch-writing.md
      tools/
        export_markdown.ts

  db/
    schema.ts
    queries.ts

  components/
    arena/
      TeamCard.tsx
      ProposalCard.tsx
      AttackCard.tsx
      DefenseCard.tsx
      Scoreboard.tsx
      ReplayTimeline.tsx
      ArtifactViewer.tsx
      PassportCard.tsx
```

---

## 18. Implementation Priority

### P0

* Create Battle
* Battle State Machine
* Fixed Eve Agent Teams
* Proposal Round
* Cross Attack Round
* Judge Round
* Scoreboard
* Champion Selection
* Artifact Generation
* Event Log
* Replay Page
* Agent Passport Snapshot
* Export Markdown

### P1

* Streaming events
* Example battle
* Battle share page
* Better visual design

### P2

* Custom Agent Teams
* Eve skills editor
* Eve tools editor
* MCP connections
* Sandbox verification
* Scheduled evals
* Agent leaderboard

---

## 19. Demo Input

```text
I want to build a product around the agent metaverse for a hackathon. It should be fun, technically interesting, and not just another multi-agent workspace.
```

Expected result:

* Safe Builder proposes a practical workspace.
* Viral Designer proposes Agent Arena.
* Infra Hacker proposes Agent Reputation Protocol.
* Viral Designer attacks Safe Builder as too generic.
* Judge says Infra Hacker is technically strong but hard to demo.
* Viral Designer wins.
* Artifacts are generated.
* Replay shows the battle.
* Passport shows agent contribution.

---

## 20. Acceptance Criteria

### Functional

* User can start a battle.
* Three Eve Agent Teams generate proposals.
* Teams attack each other.
* Judge Panel scores all teams.
* Champion is selected by system.
* At least four artifacts are generated.
* Replay is generated from event log.
* Passport snapshot is shown.
* Markdown export works.

### Product

* User understands difference from generic agent workspace in 30 seconds.
* Demo has at least five screenshot-worthy states.
* Result explains why winner won.
* Replay reads like a story.
* Passport hints at long-term reputation network.

### Technical

* Agent outputs are schema-validated.
* Battle Engine controls flow.
* Event log persists every key action.
* Score is calculated by code.
* Replay is generated from events.
* Failure fallback exists for live demo.

---

## 21. Hackathon Risk Controls

### Risk: Eve integration takes longer than expected

Fallback:

* Keep Eve-style directory structure.
* Mock Eve agent calls with model calls.
* Preserve architecture and demo story.

### Risk: Battle takes too long

Fallback:

* Use seeded battle.
* Limit attack count.
* Generate artifacts only for champion.
* Pre-cache example battle.

### Risk: AI output breaks schema

Fallback:

* Retry once.
* Repair once.
* Use fallback template.

### Risk: Live demo fails

Fallback:

* Open seeded replay.
* Explain it was generated by the same battle pipeline.

---

## 22. Final Architecture Principle

Eve is the agent substrate.

Battle Engine is the product moat.

Event Log is the evidence layer.

Passport is the reputation seed.

Replay is the viral surface.
