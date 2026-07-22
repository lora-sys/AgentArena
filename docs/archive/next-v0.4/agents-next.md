# agents.md — Role Orchestration & Handoff Protocol

> Read after `CLAUDE.md`. This file defines WHO does WHAT, what evidence each role must produce, and how work crosses role boundaries.

## 1. Team shape (P0)

| Role | Chinese handle | Owns | Receives evidence from | Hands off evidence to |
|---|---|---|---|---|
| **Backend Engineer 雅座** | 后端工程师 | `packages/battle-engine`, `packages/agent-runtime`, `packages/schemas`, `packages/event-store`, `agents/*/spec.yaml`, `apps/web/app/api/*` | PRD (source of truth), UI/UX (API contracts) | Frontend (API + SSE contracts), QA (test seeds) |
| **UI/UX Designer** | UI 设计师 | `packages/ui-kit`, `docs/design.md`, `docs/learnings/visual/*` | PRD §16 (page map + screenshot points), Backend (event payload shapes) | Frontend (tokens + components), QA (visual regression baselines) |
| **Frontend Engineer 老师** | 前端工程师 | `apps/web/app/**` (pages, layouts), `apps/web/lib/sse`, `apps/web/components/**` | UI/UX (tokens + components), Backend (API/SSE contracts) | QA (E2E journeys + screenshots) |
| **QA Engineer** | 测试工程师 | `docs/test-guidelines.md`, `apps/web/tests/e2e/**`, `packages/test-utils/**`, regression matrix | Backend (engines + fixtures), Frontend (deployed preview), UI/UX (visual baselines) | All (test reports, coverage, blockers) |

**Parallel mode (this project)**: 2+2.
- Wave 1 (Sprint 0–1): Backend + UI/UX run in parallel. Backend builds engine on a mock event payload contract that UI/UX uses to mock the arena screen.
- Wave 2 (Sprint 2–5): Frontend + QA run in parallel. Frontend wires real APIs; QA writes journeys against a deployed preview.

## 2. Per-role workspace contract

Each role owns a slice of the repo and a slice of the docs. When you finish a unit of work, your evidence lands in BOTH places.

### 2.1 Backend (雅座) — workspace

**Owns**: `packages/battle-engine`, `packages/agent-runtime`, `packages/schemas`, `packages/event-store`, `agents/<team>/spec.yaml`, `apps/web/app/api/**`

**Daily flow**:
1. Pull ticket from sprint board. Read linked PRD section.
2. If touching a public API, write contract first in `docs/adr/NNNN-<api>.md` and ping Frontend for review.
3. TDD: write Vitest cases in `<pkg>/tests/`, watch them fail.
4. Implement, watch them pass.
5. Run `pnpm typecheck && pnpm lint && pnpm test` in touched packages.
6. Commit. Append a learning note to `docs/learnings/backend.md`.
7. Hand off via PR description: what changed, evidence files, breaking changes.

**Acceptance bar**:
- Coverage ≥80% lines / ≥70% branches on touched packages (PRD §22).
- Every new event type added → registered in `packages/schemas/src/events.ts` AND added to PRD §13.4 (commit msg: `docs: register ev_xxx in PRD §13.4`).
- Every new API endpoint → OpenAPI snippet in `docs/api/<endpoint>.yaml` + Playwright contract test stub.
- Mastra is the only allowed runtime dep in `packages/agent-runtime`. Anything else triggers ADR.

**Custom skill prompt** — drop into `.claude/commands/be-task.md`:
```
You are the Backend Engineer for Agent Arena. Before each task:
1. Read docs/CLAUDE.md (workspace + invariants) and docs/agents.md (handoff protocol).
2. Read PRD §<linked-section> in Agent_Arena_PRD_v0.4_Reputation_Arena_Product_Manual.md.
3. Load skills: everything-claude-code:tdd, everything-claude-code:backend-patterns,
   everything-claude-code:coding-standards, everything-claude-code:api-design.
4. Write failing tests first. Never skip a red step.
5. Implement against packages/schemas Zod schemas. Never hand-write types that Zod should generate.
6. End every turn with: (a) what changed, (b) evidence files, (c) open questions.
Append a 3-line learning to docs/learnings/backend.md at end of session.
```

### 2.2 UI/UX Designer — workspace

**Owns**: `packages/ui-kit`, `docs/design.md`, `docs/learnings/visual/`, Figma/source-of-truth files at `docs/design/figma.fig` or `docs/design/tokens.json`.

**Visual direction** (B — Linear × 体育数据可视化, locked):
- Type: Inter Display (titles) + Inter Variable (body) + Geist Mono (data).
- Palette: light default; dark variant. Tokens below.
- Motion: stagger fade-up, SSE-driven timeline progress, no bouncing.
- Voice: short labels, declarative, evidence-first.

**Initial tokens (frozen, more in `design.md` next round)**:

```css
:root {
  --bg: #FAFAF9;        --bg-elev: #FFFFFF;
  --fg: #0A0A0A;        --fg-muted: #6B6B6B;
  --border: #E7E5E4;    --border-strong: #D6D3D1;

  --team-safe: #2563EB;     /* Safe Builder */
  --team-viral: #EC4899;    /* Viral Designer */
  --team-infra: #059669;    /* Infra Hacker */
  --champion: #D4AF37;      /* gold seal */
  --severity-low: #94A3B8;
  --severity-med: #F59E0B;
  --severity-high: #DC2626;
  --severity-fatal: #7C2D12;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0A0A0A;        --bg-elev: #171717;
    --fg: #FAFAF9;        --fg-muted: #A3A3A3;
    --border: #262626;    --border-strong: #404040;
  }
}
```

**Six screenshot points** (PRD §16.3) — must each get one frame in `docs/learnings/visual/`:
1. Agent Team entrance
2. Three proposals side-by-side
3. Cross Attack matrix
4. Defense / revision cards
5. Judge scoreboard
6. Passport Snapshot

**Daily flow**:
1. Read PRD § linked. Open Figma/token file.
2. Produce: tokens (CSS variables) → components (Storybook) → page mocks → motion spec.
3. Visual review via `agent-browser` at `http://localhost:6006` (Storybook). Save PNGs to `docs/learnings/visual/<component>-<date>.png`.
4. Hand off: tokens JSON + Storybook link + screenshots.

**Acceptance bar**:
- All six PRD §16.3 screenshot points covered with ≥1 frame each.
- WCAG AA contrast on every text/background pair.
- Storybook has story for every `ui-kit` component (states: default / hover / disabled / loading / error).
- Motion respects `prefers-reduced-motion`.

**Custom skill prompt** — `.claude/commands/ui-task.md`:
```
You are the UI/UX Designer for Agent Arena (visual direction B).
1. Read docs/design.md (next round) and docs/agents.md.
2. Load skills: ui-ux-pro-max, frontend-design, web-design-guidelines.
3. For each task, produce: (a) updated tokens, (b) Storybook story, (c) ≥1 agent-browser screenshot in docs/learnings/visual/.
4. Reject any component that violates the frozen palette or the six screenshot points.
5. End every turn with: tokens diff, components added, screenshots captured.
```

### 2.3 Frontend (老师) — workspace

**Owns**: `apps/web/app/**` (App Router pages + layouts), `apps/web/components/**`, `apps/web/lib/sse/**`, `apps/web/lib/state/**`.

**Pages** (PRD §16.1):
- `/` Home — "Every agent claims to be powerful. Agent Arena makes them prove it."
- `/battle/new` Trial setup (form: idea, time budget, mode quick/full)
- `/battle/[id]/live` SSE-driven timeline
- `/battle/[id]/result` Champion card + scoreboard + artifacts
- `/battle/[id]/replay` Evidence chain
- `/agent/[id]/passport` Passport Snapshot
- `/examples/[id]` Pre-baked demo

**Daily flow**:
1. Read PRD § + UI/UX tokens + Backend contract.
2. Build page → wire SSE → handle loading/error/empty states for each event type.
3. Run Playwright locally. Then `agent-browser screenshot <url> docs/learnings/visual/web-<page>-<date>.png` for review.
4. Hand off: PR + screenshots + Lighthouse report snippet.

**Acceptance bar**:
- Lighthouse mobile ≥90 perf, ≥95 a11y, ≥95 best-practices, ≥95 SEO.
- Every page works without JS for static content (Next.js streaming OK for SSE).
- Reduced-motion respected.
- No direct call to OpenAI / Mastra from frontend. Always via `apps/web/app/api/*`.
- Every event payload from SSE validated by Zod before render.

**Custom skill prompt** — `.claude/commands/fe-task.md`:
```
You are the Frontend Engineer for Agent Arena.
1. Read docs/CLAUDE.md, docs/agents.md, docs/design.md (when it exists).
2. Load skills: everything-claude-code:frontend-patterns, everything-claude-code:coding-standards,
   agent-browser, playwright-cli.
3. For UI work: use ui-kit primitives only. Never hand-roll a Card.
4. For SSE work: validate every payload with the Zod schema in packages/schemas.
5. End every page with: Lighthouse score, screenshots (mobile + desktop), reduced-motion check.
```

### 2.4 QA — workspace

**Owns**: `docs/test-guidelines.md`, `apps/web/tests/e2e/**`, `packages/test-utils/**`, `docs/qa/<sprint>-report.md`.

**Daily flow**:
1. Pull "test plan" ticket. Read PRD § + UI tokens + Backend contracts.
2. Write Playwright journeys per the matrix in `test-guidelines.md` (next round).
3. For visual: agent-browser screenshots into `docs/qa/visual/<id>.png`. Diff against UI/UX baselines.
4. Run matrix on every PR preview deploy. File issues with reproduction steps + expected vs actual.
5. Produce per-sprint report: coverage delta, journey pass rate, flaky tests quarantined, evidence links.

**Acceptance bar**:
- Coverage ≥80% lines on engine/runtime/schemas/store; ≥60% on ui-kit.
- E2E coverage matrix: every PRD §8.3 row maps to ≥1 journey.
- Zero P0 bugs unfiled at sprint end. P1 may carry.
- Every reported bug has: repro steps, expected, actual, screenshot/trace link.

**Custom skill prompt** — `.claude/commands/qa-task.md`:
```
You are the QA Engineer for Agent Arena.
1. Read docs/test-guidelines.md (next round), docs/agents.md.
2. Load skills: everything-claude-code:e2e-testing, everything-claude-code:tdd,
   playwright-cli, agent-browser.
3. For each test: write the failing journey first. Capture screenshots and traces as evidence.
4. Reject any "done" PR that lacks the evidence files listed in agents.md §3.
5. End every turn with: test report snippet, flaky test log, new blockers.
```

## 3. Handoff protocol

Every cross-role handoff MUST include an evidence block. PR template (`docs/.github/pull_request_template.md`) enforces this:

```markdown
## Evidence
- [ ] Unit/integration tests pass (coverage delta attached)
- [ ] E2E journey(s) added or updated
- [ ] Visual screenshots in docs/learnings/visual/ (if UI touched)
- [ ] PRD §-section this implements cited in commit body
- [ ] No invariant from CLAUDE.md §7 violated
```

### Inter-role contracts

These are the only stable handoff surfaces. If a contract changes, ADR first.

| Contract | Producer | Consumer | Lives in |
|---|---|---|---|
| OpenAPI spec | Backend | Frontend, QA | `docs/api/openapi.yaml` |
| SSE event schemas | Backend | Frontend, QA | `packages/schemas/src/events.ts` |
| Design tokens | UI/UX | Frontend | `packages/ui-kit/src/tokens.css` + `docs/design/tokens.json` |
| Visual baselines | UI/UX | QA | `docs/qa/visual-baselines/` |
| Test fixtures | Backend | QA | `examples/fixtures/` |
| Battle engine runtime | Backend | QA | `packages/agent-runtime/src/contract.ts` |

## 4. Sprint plan (PRD §27 expanded)

Each sprint has a Definition of Done (DoD). Sprint can only close when DoD met.

### Sprint 0 — Skeleton
- **Backend**: monorepo init, Drizzle schema, Zod schemas, AgentSpec YAML skeleton, mock runtime, `docs/api/openapi.yaml` skeleton.
- **UI/UX**: tokens.css frozen, ui-kit scaffold (Button/Card/Badge/SeverityTag), Storybook running, six screenshot-point skeletons.
- DoD: `pnpm install && pnpm typecheck && pnpm test && pnpm --filter ui-kit storybook` all green.

### Sprint 1 — Battle Engine
- **Backend**: state machine (PRD §11.2), round runner, event writer, schema repair retry.
- DoD: a Battle can run end-to-end with mock runtime, all events land in Postgres, replay view model reconstructs identically after process restart.

### Sprint 2 — Mastra Runtime + Agents
- **Backend**: Mastra adapter for `ArenaAgentRuntime`, all 5 agents (Safe/Viral/Infra/Judge/Artifact) producing Zod-validated output.
- DoD: real Battle runs in 2-5 min, every output passes Zod, judge produces clear winner ≥90% of runs (PRD §24.1).

### Sprint 3 — Arena UI
- **Frontend**: Home, Battle Setup, Live (SSE), Result pages. ui-kit consumption.
- **QA**: E2E journeys for Happy Path + every PRD §22 failure mode.
- DoD: full battle is demoable from `/battle/new` to `/battle/[id]/result`. Lighthouse scores hit bar.

### Sprint 4 — Replay + Passport + Export
- **Frontend**: Replay page, Passport page, Markdown export.
- **QA**: visual regression on all six screenshot points.
- DoD: page refresh rebuilds all three views from event store alone. Export round-trips.

### Sprint 5 — Demo hardening
- **Backend**: Example Battle seed, retry/fallback paths, cost guard.
- **Frontend**: 404/500 pages, empty states, reduced-motion audit.
- **QA**: 3 consecutive full battles pass; load test 5 concurrent battles.
- DoD: PRD §24.1 metrics all hit. 30-second pitch script runnable.

## 5. Knowledge accumulation

Every engineer session MUST append a 3-5 line learning to their role file before closing:

| Role | File |
|---|---|
| Backend | `docs/learnings/backend.md` |
| Frontend | `docs/learnings/frontend.md` |
| UI/UX | `docs/learnings/ui.md` |
| QA | `docs/learnings/qa.md` |
| Cross-cutting | `docs/learnings/<topic>.md` |

Format:
```
### YYYY-MM-DD · <ticket-id>
- learned: <one sentence, no jargon>
- applies when: <trigger condition>
- see also: <PRD § or file>
```

Visual artifacts (screenshots, traces, recordings) go to `docs/learnings/visual/` regardless of role.

## 6. Custom skills to scaffold in Sprint 0

These are role-specific slash-commands that each engineer can invoke to load the right context fast:

```
.claude/commands/
├── be-task.md       # Backend Engineer session prompt (§2.1)
├── fe-task.md       # Frontend Engineer session prompt (§2.3)
├── ui-task.md       # UI/UX Designer session prompt (§2.2)
└── qa-task.md       # QA Engineer session prompt (§2.4)
```

Each ~30 lines, designed to be pasted at the start of an engineer session to load context + skills in one shot. This is the answer to "engineers have limited context and need to ramp fast".

## 7. Conflict resolution

1. PRD trumps all.
2. CLAUDE.md invariants (§7) trumps agents.md.
3. ADRs trump implementation, but every implementation change with downstream impact requires an ADR first.
4. Unresolvable disagreement → file `docs/adr/NNNN-<topic>.md` with both options + tradeoffs, defer to product owner.