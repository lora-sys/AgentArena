# Coverage Map

## Purpose

Use this document to check whether the project docs cover the work area you are about to touch.

Do not use it as a substitute for any source doc. Do not use it for acceptance decisions; use [acceptance-standards.md](acceptance-standards.md). Do not use it for review findings; use [skills/review-skill-guide.md](skills/review-skill-guide.md).

## Coverage Matrix

| Area | Covered By | Status | Notes |
| --- | --- | --- | --- |
| Product vision | [prd.md](prd.md) | Covered | Long-term direction and positioning. |
| MVP behavior | [mvp-spec.md](mvp-spec.md) | Covered | Schemas, routes, rounds, acceptance basics. |
| Eve agent design | [eve-agents.md](eve-agents.md) | Covered | Agent directories, instructions, skills, tools. |
| Build order | [development-plan.md](development-plan.md) | Covered | Phase gates from docs-first to live battle. |
| Validation goals | [validation-goals.md](validation-goals.md) | Covered | Product, technical, and demo validation. |
| UI direction | [ui-react-bits.md](ui-react-bits.md) | Covered | Screenshot targets and React Bits boundaries. |
| Architecture invariants | [architecture-contracts.md](architecture-contracts.md) | Covered | Runtime rules and data ownership. |
| Change process | [change-control.md](change-control.md) | Covered | What docs to update for each class of change. |
| Debugging | [debugging-manual.md](debugging-manual.md) | Covered | Reproduction and diagnosis order. |
| Diagnostics | [diagnostic-tools.md](diagnostic-tools.md) | Covered | Current and future health checks. |
| Failure history | [failure-archaeology.md](failure-archaeology.md) | Seeded | Template exists; real failures not yet recorded. |
| Acceptance standards | [acceptance-standards.md](acceptance-standards.md) | Covered | P0/P1 acceptance gates. |
| Project skill routing | [skills/project-skill-guide.md](skills/project-skill-guide.md) | Covered | When to use each project doc. |
| Review process | [skills/review-skill-guide.md](skills/review-skill-guide.md) | Covered | Three-lane review: facts, logic, usability. |
| Startup | [../scripts/start.sh](../scripts/start.sh) | Covered | Conservative docs-first behavior until app exists. |
| Doctor check | [../scripts/doctor.sh](../scripts/doctor.sh) | Covered | Required docs and screenshots checked. |

## Known Gaps

These are intentionally not covered yet:

- Real Eve API integration details.
- Database schema migration scripts.
- Real model provider configuration.
- Browser/UI screenshot test script.
- CI configuration.
- Deployment procedure.
- Security review for external tools and sandbox execution.

## When A Gap Becomes Work

When implementation enters a gap area:

1. Add or update the owning doc.
2. Add a diagnostic or acceptance check when possible.
3. Update this coverage map.
4. Run the three-way review from [skills/review-skill-guide.md](skills/review-skill-guide.md).
