# Contributing to Agent Arena

Welcome. Agent Arena is a reputation arena for AI agent teams — three teams enter a structured Battle, generate proposals, attack each other, defend, get scored, and produce replayable evidence plus an Agent Passport Snapshot. The PRD is the source of truth: [`Agent_Arena_PRD_v0.4_Reputation_Arena_Product_Manual.md`](./Agent_Arena_PRD_v0.4_Reputation_Arena_Product_Manual.md).

Before you start, read:
1. [`docs/CLAUDE.md`](./docs/CLAUDE.md) — workspace, tech stack, invariants (this is non-negotiable)
2. [`docs/agents.md`](./docs/agents.md) — role boundaries and handoff protocol

## Development Setup

### Prerequisites

- Node.js 20 LTS (see `.nvmrc`)
- pnpm 9
- PostgreSQL 16 (local or via Docker for event-store work)
- OpenAI API key (only for Sprint 2+ real LLM runs)

### Steps

```bash
nvm use                    # picks Node 20 from .nvmrc
pnpm install               # workspace install
cp .env.example .env.local # then fill in OPENAI_API_KEY and DATABASE_URL
pnpm typecheck             # tsc --noEmit across workspace
pnpm lint                  # ESLint (0 errors / 0 warnings required)
pnpm test                  # Vitest across workspace
pnpm dev                   # all packages in watch mode; web on :3000
```

If `pnpm db:push` or `pnpm db:seed:example` fails, verify `DATABASE_URL` points to a reachable Postgres instance.

## Branch Model

Per `docs/CLAUDE.md` §10:

- `feat/<scope>-<desc>` — new feature
- `fix/<scope>-<desc>` — bug fix
- `refactor/<scope>-<desc>` — internal change, no behavior delta
- `docs/<desc>` — documentation only
- `chore/<desc>` — tooling or maintenance
- `test/<desc>` — test-only changes
- `perf/<scope>-<desc>` — performance
- `ci/<desc>` — CI/CD only

Keep branches short-lived. One concern per branch. Rebase onto `main` before opening a PR.

## Commit Message Style

Per `docs/CLAUDE.md` §10 and the global git workflow rule:

```
<type>: <description>

<optional body>
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`.

Examples from this repo:

```
feat(sprint-0): wave 2 — Mastra adapter + repair loop + event store + mock runtime
fix(rate-limit): spoofable X-Forwarded-For → last-hop IP validation
docs: register ev_xxx in PRD §13.4
```

Every commit body that touches a PRD feature must cite the section (`Closes PRD §11.2`). Critical invariant violations are rejected — see `docs/CLAUDE.md` §7.

## Pull Request Template

Use the template at [`docs/.github/pull_request_template.md`](./docs/.github/pull_request_template.md). Every PR must include an Evidence block:

```markdown
## Evidence
- [ ] Unit/integration tests pass (coverage delta attached)
- [ ] E2E journey(s) added or updated
- [ ] Visual screenshots in docs/learnings/visual/ (if UI touched)
- [ ] PRD §-section this implements cited in commit body
- [ ] No invariant from CLAUDE.md §7 violated
```

PRs that lack evidence are bounced. Reviewers will check, not assume.

## Testing Requirements

Per `docs/CLAUDE.md` §9 and `docs/test-guidelines.md`:

| Package | Coverage floor |
|---|---|
| `battle-engine`, `agent-runtime`, `schemas`, `event-store` | ≥80% lines, ≥70% branches |
| `ui-kit` | ≥60% lines (visual via Storybook) |

- Tests colocated with source as `*.test.ts` / `*.test.tsx`
- Integration tests under `<pkg>/tests/`
- E2E lives in `apps/web/tests/e2e/` (Playwright)
- Visual regression baselines in `docs/qa/visual-baselines/`
- Every example battle fixture lives in `examples/fixtures/`

Run before pushing:

```bash
pnpm typecheck && pnpm lint && pnpm test
```

CI runs typecheck, lint, test (with coverage), build, and e2e — all must be green.

## Code Review Expectations

Every PR gets reviewed by at least one maintainer. Reviews follow the adversarial lens principle (see `docs/CLAUDE.md` §7 and the reviewer agents in `docs/sessions/code-review/`):

- **Correctness** — does it match the PRD section it cites?
- **Invariants** — does it violate any rule in `docs/CLAUDE.md` §7?
- **Package boundaries** — does it follow the import direction rules in `docs/CLAUDE.md` §4?
- **Tests** — is coverage above the floor for the touched package?
- **Evidence** — are screenshots, journey files, and coverage deltas attached?

Critical and High issues block merge. Medium issues should be fixed in the same PR or filed as a follow-up. Low issues may carry.

## Package Boundary Rules (summary)

These rules exist to keep modules replaceable. Breaking them requires an ADR in [`docs/adr/`](./docs/adr/).

1. `apps/web` may import from any `packages/*` package. Never the reverse.
2. `packages/battle-engine` does NOT import from `packages/agent-runtime` or `packages/ui-kit`. Engine calls runtime through the `ArenaAgentRuntime` interface.
3. `packages/schemas` has zero runtime deps beyond `zod`.
4. `packages/event-store` is the only package that talks to Postgres directly.
5. `packages/ui-kit` has no domain knowledge.
6. `agents/*` are prompt/spec files only — code lives in `packages/agent-runtime`.

Dependency direction:

```
apps/web → packages/* → (no reverse edges)
```

## Knowledge Accumulation

Every engineer session must append a 3-5 line learning to their role file before closing:

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

## Questions?

Open an issue. If it is a security concern, do not open a public issue — contact the maintainers directly per the security policy (if any). For design questions, link the PRD section in question so others can follow the thread.

## License

By contributing, you agree that your contributions will be licensed under the MIT License — see [`LICENSE`](./LICENSE).