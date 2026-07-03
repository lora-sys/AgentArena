# Acceptance Standards

## Purpose

Use this document to decide whether a change is acceptable. It is stricter than the roadmap and more concrete than the PRD.

Do not use it to plan phases; use [development-plan.md](development-plan.md). Do not use it to debug why a gate fails; use [debugging-manual.md](debugging-manual.md). Do not use it to review docs in parallel; use [skills/review-skill-guide.md](skills/review-skill-guide.md).

## MVP Acceptance

The MVP is accepted only if all P0 gates pass.

## P0 Product Gates

- User can enter an idea.
- System creates a Battle Brief.
- Three fixed teams produce distinct proposals.
- Teams critique each other.
- Teams defend or revise.
- Judge Panel scores every team.
- System selects champion by calculated total.
- Artifacts are generated.
- Replay is generated.
- Agent Passport snapshot is generated.
- Markdown export works.

## P0 Evidence Gates

- Every round writes an event.
- Event log can reconstruct the replay.
- Passport facts are traceable to the battle.
- Judge comments do not override calculated scores.

## P0 UI Gates

- Home shows the product difference immediately.
- Battle Setup is usable without reading docs.
- Live page shows current round, teams, attacks, and judge progress.
- Result page shows champion, scoreboard, artifacts, and export.
- Replay page shows event sequence and share surface.
- Passport page shows contribution, accepted claims, rejected claims, strengths, and weaknesses.
- At least five screenshot moments are present.

## P0 Reliability Gates

- `./scripts/start.sh` works once app scaffold exists.
- Seeded battle works without model calls.
- Live battle has fallback.
- Three consecutive demo runs do not crash.

## P1 Acceptance

- Event streaming or fast polling.
- Example battle.
- Battle share page.
- Better React Bits polish.
- Eve directory preview.

## Explicit Non-Acceptance

Do not accept a change that:

- Lets the model choose the winner directly.
- Adds marketplace before MVP replay works.
- Adds long-term reputation UI without data support.
- Introduces undocumented startup commands.
- Adds heavy visual effects that slow the core demo.
