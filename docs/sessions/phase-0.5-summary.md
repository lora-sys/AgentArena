# Phase 0.5 — Post-Review Fixes (2026-07-10)

## What shipped
- 10 critical bugs fixed across 3 adversarial review rounds
- 8 fresh visual baselines confirming UI correctness
- Replay client effect loop + scroll alignment fixed

## Review waves
| Round | Reviewer | Findings | Criticals fixed |
|---|---|---|---|
| 1 | reviewer-2-types (Zod/type) | 3 crit + 5 high + 17 med | 3 (runtime layer) |
| 1 | reviewer-3-invariants (PRD/security) | 2 crit + 6 high + 8 med | 2 (DB schema + allowlist + battle ID) |
| 2 | reviewer-4-attack-matrix | 3 crit + 4 high + 8 med | 3 (ARIA grid + button + aria-controls) |
| 2 | reviewer-5-passport-scoreboard | 2 crit + 3 high + 6 med | 2 (evidence link ID + domain/event mapping) |
| 2 | reviewer-6-design-system | 3 crit + 9 high + 14 med | 3 (raw hex + champion gold misuse) |
| 3 | reviewer-7-replay-lookup | 2 crit + 4 high + 5 med | 2 (effect feedback loop + scroll alignment) |

Total: 8 criticals from 6 reviewer agents, all fixed in this session.

## Process learnings
- Adversarial review with 3+ different lenses catches different bug classes
- Each fix agent needs ~3-5 min; reviewers need ~3-7 min
- Post-fix visual baselines catch any regressions from the fixes
- "Effect with self-set state in deps" is a common React bug — reviewer-7 found one we'd have shipped
