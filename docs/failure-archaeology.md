# Failure Archaeology

## Purpose

Use this document after a failure has been understood enough to record a reusable lesson.

Do not use it for active debugging; use [debugging-manual.md](debugging-manual.md). Do not use it for acceptance gates; use [acceptance-standards.md](acceptance-standards.md). Do not use it for change approval; use [change-control.md](change-control.md).

## Entry Template

```md
## YYYY-MM-DD - Short Failure Name

Context:

What failed:

Root cause:

Why existing docs/tests missed it:

Fix:

Prevention:

Sibling docs updated:
```

## Known Failure Patterns To Watch

### Prompt Theater

Symptom:

The product feels like three prompted answers plus a summary.

Prevention:

- Preserve event log.
- Show cross-attack.
- Show deterministic scoring.
- Show why the champion won.

### Fake Reputation

Symptom:

Passport claims long-term credibility from one run.

Prevention:

- Separate MVP Passport snapshot from future network reputation.

### Undocumented Command

Symptom:

README tells users to run a command that no script or package supports.

Prevention:

- Review docs with [skills/review-skill-guide.md](skills/review-skill-guide.md).
- Keep `scripts/doctor.sh` aligned with README.

### Overbuilt First Version

Symptom:

The team starts building marketplace, protocol, or sandbox before the seeded battle works.

Prevention:

- Follow [development-plan.md](development-plan.md).
- Phase 1 and Phase 2 gates must pass first.

## First Recorded Notes

No implementation failure has been recorded yet. The first likely failure to document will be either startup scaffold drift or React Bits overuse before the static MVP shell is stable.
