# test-guidelines.md — Agent Arena Test Strategy & Evidence Rules

> Owner: QA Engineer. Consumed by Backend (雅座), Frontend (老师), UI/UX Designer.
>
> Read `CLAUDE.md` (invariants §7) and `agents.md` (handoff protocol §3) first. This file owns the **how** of "done".

---

## 1. Strategy

### 1.1 Why we test

Every visible behavior must be reproducible from the event store alone (PRD §22, §13). Tests are the executable form of that promise.

### 1.2 Pyramid

```
        ▲   E2E (Playwright journeys, agent-browser visual)
       ╱ ╲    ← slow, expensive, run on PR + nightly
      ╱───╲
     ╱     ╲  Contract (OpenAPI round-trip, SSE event schema)
    ╱       ╲  ← runs on PR, must be green to merge
   ╱─────────╲
  ╱           ╲ Integration (cross-package, real Postgres in Docker)
 ╱             ╲  ← runs on PR
╱───────────────╲
│                 │ Unit (Vitest, colocated)
│                 │  ← runs on every commit, < 30s target
└─────────────────┘
```

Visual regression and load tests sit outside the pyramid — they're release gates.

### 1.3 What each layer proves

| Layer | Proves |
|---|---|
| Unit | A function honors its contract for every edge case in isolation |
| Integration | Two packages talk correctly using real boundaries (Postgres, SSE wire format) |
| Contract | The published API matches the schema, and the schema matches what consumers expect |
| E2E | A real user can complete the full happy path in a real browser |
| Visual | UI matches the locked design tokens and screenshot points |
| Load | The system holds under PRD §24 cost/time budget |

### 1.4 What we don't test

- LLM creativity or output quality in unit tests (that's judge score correlation, see §9.2)
- Internal model selection (covered by mock runtime swap)
- Vercel deployment infra (use their status page)
- Browser engine bugs (Playwright manages)

---

## 2. Coverage bar

Enforced in CI. PR blocked if any touched package drops below its bar.

| Package | Lines | Branches | Functions | Notes |
|---|---:|---:|---:|---|
| `packages/battle-engine` | ≥80% | ≥70% | ≥75% | Round runner + state machine + event writer |
| `packages/agent-runtime` | ≥80% | ≥70% | ≥75% | Runtime adapter + schema repair |
| `packages/schemas` | ≥95% | ≥90% | ≥95% | Schemas are the contract; cover every field |
| `packages/event-store` | ≥80% | ≥70% | ≥75% | Repository implementations |
| `packages/ui-kit` | ≥60% | ≥50% | ≥60% | Visual coverage comes from Storybook + agent-browser |
| `apps/web` (lib + app dir) | ≥70% | ≥60% | — | E2E journeys carry the weight for pages |

**Per-file floor**: no file below 40% line coverage can land in `main`. Even scaffolding files need tests.

**Coverage delta rule**: PR must not drop overall coverage. If a refactor temporarily drops a file, that PR must include the test that restores it.

---

## 3. Categories

### 3.1 Unit (`*.test.ts` colocated with source)

- Vitest. No external services. No network. No Postgres. Pure functions + in-memory mocks.
- Naming: `describe('<function name>')`, nested `describe` for branches.
- Pattern: arrange / act / assert. Use `expect(...).toMatchInlineSnapshot()` sparingly; prefer explicit assertions.
- Property-based: `fast-check` allowed for state machine round ordering, schema repair loop.

### 3.2 Integration (`<pkg>/tests/integration/`)

- Real Postgres in Docker (`docker-compose.test.yml`).
- Real packages wired together (engine ↔ store ↔ mock runtime).
- Each integration test sets up its own fixtures, tears down in `afterEach`.
- Test DB recreated per test run. No shared state across runs.

### 3.3 Contract (`packages/test-utils/contract-tests/`)

- OpenAPI round-trip: every endpoint declared in `docs/api/openapi.yaml` has a happy-path request/response test that asserts the schema.
- SSE event round-trip: every event type in `packages/schemas/src/events.ts` has a serialize → deserialize → re-validate test.
- Schema repair contract: any model output that fails Zod is repaired up to 3 times; repair attempts themselves are events.

### 3.4 E2E (`apps/web/tests/e2e/`)

- Playwright. Real Next.js server. Real Postgres (via test container).
- One journey file per user-visible flow.
- Each journey is independently runnable. No order dependency.
- Browser matrix (initial): Chromium, WebKit (mobile). Firefox deferred to P1.
- Viewport matrix: 1440x900, 390x844. Each journey runs both.

### 3.5 Visual (agent-browser, NOT Playwright visual)

- Used for design review and PR screenshot evidence. See §6.
- Stored in `docs/qa/visual-baselines/` (lock) and `docs/learnings/visual/` (WIP).
- Diff threshold: <0.2% pixel difference tolerated for font-rendering noise. Anything more = visual regression.

### 3.6 Load & cost

- `k6` or `autocannon`. Run weekly + before any release.
- Targets per PRD §24.1:
  - Full Battle: 2–5 min wall-clock
  - Quick Battle: 60–90 s
  - ≥80% battles complete
  - cost dashboard stays under `BATTLE_DEFAULT_COST_CENTS` per battle

---

## 4. Evidence format per PR

CI produces and attaches:

| Artifact | Path | Purpose |
|---|---|---|
| Unit + integration JUnit XML | `coverage/<pkg>/junit.xml` | Pass/fail + duration |
| Coverage HTML + lcov | `coverage/<pkg>/lcov.info` | Coverage diff vs base |
| E2E Playwright report | `apps/web/tests/e2e/playwright-report/` | Steps + screenshots + traces |
| Lighthouse JSON | `apps/web/lighthouse/<page>.json` | Web perf budget |
| Contract OpenAPI diff | `coverage/contract/openapi-diff.txt` | API change summary |
| Visual diff (PR-touching UI) | `docs/qa/visual-diffs/<PR>.png` | Before/after composite |
| Screenshot set (PR-touching UI) | `docs/learnings/visual/web-<page>-*.png` | Manual review fodder |

PR template (machine-readable front matter):

```yaml
evidence:
  unit: <path or "n/a">
  integration: <path or "n/a">
  e2e: <path or "n/a">
  visual: <path or "n/a">
  lighthouse: <path or "n/a">
  coverage_delta: <path or "n/a">
```

### 4.1 CI gates (must all pass to merge)

1. Typecheck (`pnpm typecheck`) — 0 errors
2. Lint (`pnpm lint`) — 0 errors, 0 warnings
3. Unit + integration (`pnpm test`) — green
4. Contract (`pnpm test:contract`) — green
5. E2E (`pnpm e2e`) — green
6. Coverage bar (§2) — green, no per-file floor violation
7. Visual regression (if UI touched) — green
8. Lighthouse (if web touched) — meets §3.4 bar

---

## 5. E2E journey matrix

Every PRD §8.3 capability row maps to ≥1 journey. PRD §22 non-functional items each get one journey.

| PRD § | Capability | Journey file | Critical? |
|---|---|---|---|
| §8.3 Home | Home loads, CTA visible | `home.spec.ts` | yes |
| §8.3 Battle Setup | Form submits, battle_id returned | `setup.spec.ts` | yes |
| §8.3 Built-in Agents | 3 teams rendered with versions | `teams-render.spec.ts` | yes |
| §8.3 Battle Engine | Rounds execute in order | `engine-rounds.spec.ts` | yes |
| §8.3 Proposal Round | 3 proposals with schema-valid payloads | `proposal.spec.ts` | yes |
| §8.3 Attack Round | Each team has ≥2 attacks | `attack.spec.ts` | yes |
| §8.3 Defense Round | Accepted/rejected tagged | `defense.spec.ts` | yes |
| §8.3 Judge Panel | Scores have evidence ids | `judge.spec.ts` | yes |
| §8.3 Event Store | Events land in DB | `event-store.spec.ts` | yes |
| §8.3 Replay | Page rebuilds from store | `replay.spec.ts` | yes |
| §8.3 Passport | Strengths + weaknesses shown | `passport.spec.ts` | yes |
| §8.3 Export | Markdown round-trip | `export.spec.ts` | yes |
| §8.3 Demo Safety | Example battle loads without API | `example.spec.ts` | yes |
| §22 Stability | 3 consecutive battles don't crash | `stability.spec.ts` | release |
| §22 Latency | Quick Battle ≤90s | `latency-quick.spec.ts` | release |
| §22 Latency | Full Battle ≤5min | `latency-full.spec.ts` | release |
| §22 Recovery | Page refresh keeps state | `recovery.spec.ts` | yes |
| §22 Auditability | Score → evidence link works | `auditability.spec.ts` | yes |
| §22 Security | No shell, no fs.write outside allowlist | `security-allowlist.spec.ts` | release |
| §24.1 Export success | ≥90% over 10 runs | `export-success-rate.spec.ts` | release |

A row in this matrix is not "done" until its journey is green on `main` for 3 consecutive PRs.

### 5.1 Journey structure

```ts
// apps/web/tests/e2e/<name>.spec.ts
import { test, expect } from '../fixtures';
import { seedExample } from '../../../examples/fixtures';

test.describe('PRD §8.3 Attack Round', () => {
  test.beforeEach(async ({ db }) => {
    await db.reset();
    await seedExample(db, 'hackathon-001');
  });

  test('each team produces ≥2 attacks', async ({ page, live }) => {
    await page.goto('/battle/hackathon-001/live');
    await live.waitForRound('attack');
    const attacks = await live.collectAttacks();
    expect(attacks.length).toBeGreaterThanOrEqual(6);  // 3 teams × 2 targets
    for (const attack of attacks) {
      expect(attack.severity).toMatch(/low|med|high|fatal/);
      expect(attack.evidence).toMatch(/^ev_/);
    }
  });
});
```

---

## 6. agent-browser usage spec

`agent-browser` (from the `agent-browser` skill) is for **visual review and PR screenshots**. It is **not** for automated E2E — Playwright owns that. Mixing them causes flakes.

### 6.1 When to use

| Use case | Tool | Why |
|---|---|---|
| Automated regression | Playwright | Deterministic, parallel, fast feedback |
| Visual diff vs baseline | agent-browser | Easier to author ad-hoc shots |
| PR screenshot evidence | agent-browser | One-off, no flake budget |
| Design review of new component | agent-browser | Designer can paste URL, get PNG |
| Demo GIF for stakeholder update | agent-browser | Manual capture, narrative |
| Schedule a check on a deployed preview | agent-browser (one-shot) | Easier than scripting |

### 6.2 Standard commands

```bash
# Component screenshot (Storybook)
agent-browser screenshot \
  "http://localhost:6006/?path=/story/button--all-states" \
  docs/learnings/visual/ui-button-all-20260709.png

# Page screenshot, desktop
agent-browser screenshot \
  "http://localhost:3000/battle/btl_8f2a/live" \
  --viewport 1440x900 \
  docs/learnings/visual/web-live-desktop-20260709.png

# Page screenshot, mobile
agent-browser screenshot \
  "http://localhost:3000/battle/btl_8f2a/live" \
  --viewport 390x844 \
  docs/learnings/visual/web-live-mobile-20260709.png

# Reduced motion check
agent-browser screenshot \
  "http://localhost:3000/battle/btl_8f2a/live" \
  --reduced-motion \
  docs/learnings/visual/web-live-reduced-20260709.png

# Dark mode
agent-browser screenshot \
  "http://localhost:3000/agent/team_viral_v1/passport?battle=btl_8f2a" \
  --color-scheme dark \
  docs/learnings/visual/web-passport-dark-20260709.png

# Interaction trace (multi-step)
agent-browser trace \
  "http://localhost:3000/battle/new" \
  --steps "fill idea=AI voice notes to PRD|click Start|wait .live-mounted" \
  docs/learnings/visual/trace-setup-to-live-20260709.gif
```

### 6.3 Naming convention

`<source>-<page|component>-<viewport|variant>-<YYYYMMDD>.<ext>`

`<source>` ∈ `ui | web | trace`. `<viewport>` ∈ `desktop | mobile | tablet`. `<variant>` ∈ `dark | reduced | hover | focus | error`.

### 6.4 What agent-browser does NOT do

- Assert on text content (use Playwright)
- Click and verify navigation (use Playwright)
- Run in CI gate (visual diff CI step uses Playwright screenshots into `docs/qa/visual-baselines/`)

---

## 7. Flakiness policy

Flakes are technical debt with interest. Treat them as bugs.

### 7.1 Retry budget

- E2E journeys: up to 2 retries on the same CI run. If still flaky → quarantined.
- Unit / integration: zero retries. If flaky, it's a real bug.

### 7.2 Quarantine process

1. File an issue with label `flaky` and link to the failing journey + trace.
2. Move journey to `apps/web/tests/e2e/quarantine/` (excluded from PR gate).
3. Owner assigned = whoever last touched the affected code.
4. SLA: fix or formally disable within 1 sprint.
5. Weekly report: `docs/qa/<sprint>-flaky-report.md` lists open quarantines.

### 7.3 Attribution

When a journey fails, classify the failure in the report:

| Class | Examples | Owner |
|---|---|---|
| Real bug | Wrong assertion, missing fixture, schema drift | Whoever shipped the regression |
| Env | Postgres timeout, port collision, OOM | Platform / DevOps |
| Data | Example fixture stale | Whoever owns fixtures |
| Tool | Playwright version, browser update | Tooling owner |
| Genuinely flaky | Race condition, timing-dependent | Triage, refactor to remove timing |

### 7.4 Timing rules

- No `waitForTimeout`. Always `waitForFunction` or `expect(locator).toBeVisible()` with explicit timeout.
- Network waits use route interception, not real network.
- SSE tests use a deterministic event injector, not the live engine.

---

## 8. Regression suite

### 8.1 Must-pass on every PR

All unit + integration + contract + E2E from §5 critical column.

### 8.2 Nightly (1 AM local)

- All must-pass
- All release journeys (§5 release column)
- Load test (1 battle at expected PRD scale)
- Visual diff against locked baselines

### 8.3 Pre-release

- All must-pass
- All release journeys
- 3 consecutive full battles from clean DB
- Lighthouse on all web pages
- Manual walk-through of 30-second pitch script (§28.1 PRD)

### 8.4 Locked baselines

Stored in `docs/qa/visual-baselines/`. One PNG per PRD §16.3 screenshot point + one per page at desktop + mobile. Bumping a baseline requires:
1. PR with the visual change reviewed by UI designer
2. Reason in PR description ("token change to X" / "layout refactor")
3. Old baseline archived in `docs/qa/visual-baselines/archive/<date>-<reason>/`

---

## 9. Reproducibility

### 9.1 Fixtures

- `examples/fixtures/hackathon-001.json` is the canonical seeded battle. Every test that needs a battle state uses this unless the test explicitly exercises variation.
- New fixtures go in `examples/fixtures/<id>.json` with a `<id>.md` explaining what scenario it covers.
- Fixtures are immutable. To test a new scenario, add a new fixture.

### 9.2 Determinism

- All times in tests use `vi.useFakeTimers()` or injected `clock`.
- SSE event order is asserted, not just presence.
- LLM calls are replaced with mock runtime in tests. Mock outputs are versioned in `packages/agent-runtime/src/mock/` with a content hash so drift is detectable.

### 9.3 Judge score correlation

We don't assert "the right team wins" — that's not a testable contract. We assert:
- Score shape (Zod valid)
- Each score has ≥1 evidence event id
- Scores are within rubric bounds
- Champion is the highest scorer (in ties, deterministic tiebreaker)

### 9.4 Environment

`docker-compose.test.yml` pins Postgres + Redis versions. CI uses the same. Local devs may override only with a documented `LOCAL_*` env var and a comment in the file.

---

## 10. Bug report template

`.github/ISSUE_TEMPLATE/bug.yml`:

```yaml
name: Bug
labels: ["bug"]
body:
  - type: dropdown
    id: severity
    options: [P0, P1, P2, P3]
  - type: dropdown
    id: area
    options: [engine, runtime, schemas, event-store, ui-kit, web, infra, docs]
  - type: textarea
    id: repro
    attributes:
      placeholder: |
        1. go to /battle/new
        2. fill idea "..."
        3. click Start
        4. observe ...
  - type: textarea
    id: expected
  - type: textarea
    id: actual
  - type: textarea
    id: evidence
    attributes:
      placeholder: |
        - screenshot: docs/learnings/visual/<id>.png
        - trace: apps/web/tests/e2e/playwright-report/...
        - battle_id: btl_8f2a
  - type: input
    id: pr
    attributes:
      placeholder: "PR # that introduced (if known)"
```

A bug without repro steps + evidence is auto-labeled `needs-info` and waits.

---

## 11. Handoff contracts

### 11.1 Backend → QA

Backend delivers per sprint:

| Artifact | Path | Used by |
|---|---|---|
| Engine runtime | `packages/agent-runtime/src/contract.ts` | Mock runtime in tests |
| OpenAPI spec | `docs/api/openapi.yaml` | Contract tests + E2E mocks |
| Event schemas | `packages/schemas/src/events.ts` | Contract tests |
| Example fixtures | `examples/fixtures/*.json` | All E2E |
| Migration scripts | `packages/event-store/drizzle/` | Integration test setup |
| Cost dashboard query | (TBD Sprint 5) | Load test budget check |

QA cannot start contract tests until OpenAPI lands. QA cannot start E2E until at least one fixture lands. Block at planning, not at execution.

### 11.2 Frontend → QA

Frontend delivers per sprint:

| Artifact | Path | Used by |
|---|---|---|
| Routes stable | `apps/web/app/**` | Journey selectors |
| Component API | `packages/ui-kit` | Journey actions |
| SSE consumer | `apps/web/lib/sse/` | Journey SSE injection |
| Lighthouse baseline | `apps/web/lighthouse/baseline.json` | Regression threshold |

### 11.3 UI/UX → QA

| Artifact | Path | Used by |
|---|---|---|
| Visual baselines | `docs/qa/visual-baselines/` | Visual diff gate |
| Six screenshot points | `docs/learnings/visual/screenshot-*-<date>.png` | Journey reference |
| A11y checklist confirmation | (per page, in PR) | A11y journey |

### 11.4 QA → all

Per sprint:

| Artifact | Path |
|---|---|
| Test report | `docs/qa/<sprint>-report.md` |
| Coverage delta | `coverage/<sprint>/delta.json` |
| Flaky report | `docs/qa/<sprint>-flaky-report.md` |
| Open bugs rollup | `docs/qa/<sprint>-bugs.md` |
| Updated baselines | `docs/qa/visual-baselines/` (new + archive) |

Reports include: pass rate, coverage delta, top regressions, open P0/P1, quarantine list, blocked-by list.

---

## 12. Sprint cadence

| Day | QA activity |
|---|---|
| Mon | Pull sprint board. File test plan tickets for each PR scope. |
| Tue–Thu | Write/review journeys alongside feature PRs. Block merge if evidence missing. |
| Thu EOD | Snapshot coverage. File coverage-debt tickets. |
| Fri AM | Run pre-release suite if release candidate cut. |
| Fri PM | Sprint retro: write `docs/qa/<sprint>-report.md`. Update `test-guidelines.md` if policy changed. |

---

## 13. Versioning this doc

- Coverage bars (§2) require a PR + ADR to change.
- Journey matrix (§5) is appended only; rows are not deleted, only versioned (`attack.spec.ts` → `attack-v2.spec.ts`).
- Visual baseline rules (§8.4) require UI designer + QA agreement.