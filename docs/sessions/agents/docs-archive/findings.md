# Findings — Docs archive + ADR 0001

> Session: docs-archive
> Date: 2026-07-10
> Scope: GitHub issues #19 (archive Eve-first docs) + #20 (ADR 0001)

## What was done

### 1. Files moved (3 of 3)

Used `git mv` to preserve history:

| Old path | New path | Status |
|---|---|---|
| `docs/prd.md` | `docs/archive/eve-v0.3/prd.md` | R (rename in git index) |
| `docs/eve-agents.md` | `docs/archive/eve-v0.3/eve-agents.md` | R (rename in git index) |
| `docs/ui-react-bits.md` | `docs/archive/eve-v0.3/ui-react-bits.md` | R (rename in git index) |

Verified via `git status --short` — all three show as `R` (rename), not `D` + `??`.

### 2. Archive README created

`docs/archive/eve-v0.3/README.md` — explains:
- Why archived (Eve retired per PRD v0.4 §1.6)
- What was moved (table with old path, new path, content summary)
- What replaced them (table mapping each old doc to its v0.4 successor)
- How to read the archived docs (skim order + what survived in v0.4 prompts)
- Cross-references to ADR 0001 and migration plan

### 3. ADR 0001 created

`docs/adr/0001-eve-to-mastra.md`

- **Word count**: 938 words
- **Sections**: Status, Date, Deciders, Relates to, Context, Decision, Consequences (positive/negative/neutral), Alternatives Considered (A-E), Migration Scope
- **Cites**: PRD §1.6 (Eve removal), PRD §18.5 (Mastra adapter), PRD §11.3 (invariants)
- **Cross-references**: Issues #1, #2, #5
- **Alternatives considered**: Keep Eve, Rewrite from scratch, LangGraph, CrewAI, Custom in-house runtime

### 4. Root AGENTS.md updated

`AGENTS.md` — replaced the v0.3 Eve-first routing with v0.4 read order:
- New: `docs/CLAUDE.md` → `docs/agents.md` → `docs/design.md` → `docs/test-guidelines.md` → `docs/migration-v0.4.md` → `docs/adr/`
- Added: "Do NOT read (archived)" section pointing to the archive
- Added: "Core invariants" section (from `docs/CLAUDE.md` §7)
- Added: "Quick reference" table
- Removed: references to v0.3 docs (`docs/project-status.md`, `docs/development-plan.md`, `docs/eve-agents.md`, `docs/ui-react-bits.md`)

### 5. README.md updated

`README.md` — Current Status section now reflects v0.4:
- Removed: "Eve-first battle platform" tagline
- Removed: links to `docs/prd.md`, `docs/mvp-spec.md`, `docs/eve-agents.md`, `docs/development-plan.md`, `docs/project-status.md`, `docs/validation-goals.md`, `docs/ui-react-bits.md`, `docs/coverage-map.md`
- Added: links to PRD v0.4 (root), `docs/CLAUDE.md`, `docs/agents.md`, `docs/design.md`, `docs/test-guidelines.md`, `docs/migration-v0.4.md`, ADR 0001, archive README
- Updated: Read Order section to match v0.4

## Link integrity check

Searched the entire repo for references to the old paths (`docs/prd.md`, `docs/eve-agents.md`, `docs/ui-react-bits.md`).

**Intentional references (in archive)**:
- `docs/archive/eve-v0.3/README.md` — 6 matches. These are the archive index entries documenting the moves.

**Stale references found (out of scope, flagged for follow-up)**:

1. `docs/project-status.md:17` — table row mentions `docs/prd.md`. This is a v0.3-era file that is itself partially stale relative to v0.4. Not touched (hard rule: "DO NOT touch any other file"). Flagged for a follow-up docs task to reconcile `project-status.md` with v0.4.
2. `scripts/doctor.sh:33,35,38` — `check_file docs/prd.md`, `check_file docs/eve-agents.md`, `check_file docs/ui-react-bits.md`. The doctor script will fail for new agents who follow v0.4 docs. Not touched (hard rule: "DO NOT touch any other file"). Flagged for a follow-up to update doctor.sh to check v0.4 docs (`docs/CLAUDE.md`, `docs/agents.md`, etc.) and accept archived docs as historical-only.

**Root files clean**: `AGENTS.md` and `README.md` contain zero stale references to the old paths. Both reference `docs/archive/eve-v0.3/` only as the archive pointer.

## What was NOT done (out of scope)

- No commit or push (per hard rule).
- No edits to `docs/project-status.md`, `scripts/doctor.sh`, or any other file outside the scope list.
- No changes to `docs/CLAUDE.md`, `docs/agents.md`, `docs/design.md`, `docs/test-guidelines.md` (these are already v0.4-aligned).
- `docs/mvp-spec.md` mentioned in issue #19 does not exist in the repo. Flagged in issue acceptance as a non-blocker (issue says it "should contain" — the file was never created in v0.3).

## Open questions for PM

1. Should `docs/project-status.md` be deprecated or rewritten for v0.4? It is referenced from issue #19's acceptance but the file itself is v0.3-era.
2. Should `scripts/doctor.sh` be updated to validate v0.4 docs and accept archived ones with a `--archive-ok` flag?
3. Is ADR 0001 to be renumbered (it's the first ADR but the number is 0001 — fine, but should the docs/adr/ directory get a README index?).

## Evidence files

- `docs/archive/eve-v0.3/{prd.md,eve-agents.md,ui-react-bits.md,README.md}` — archived docs + index
- `docs/adr/0001-eve-to-mastra.md` — ADR (938 words)
- `AGENTS.md` — updated to v0.4 read order
- `README.md` — Current Status section updated
- This file — `docs/sessions/agents/docs-archive/findings.md`
