# R18 Frontend Pages

Date: 2026-07-10

## CRITICAL

1. **components/attack-matrix.tsx:25-30 + app/battle/demo/live/page.tsx:15-27** — The AttackMatrix filter (`cellAttacksFor`) compares `e.actorId === from.replace(/_/g, "-")`, where `from` is an internal engine team id (e.g. `"safe_builder"`) with underscores. But the demo live page constructs attacks with `actorId: uiToEngine[attack.from]` which yields underscored ids like `"safe_builder"`. The filter then compares `"safe_builder" === "safe-builder"` — always false. Every cell on `/battle/demo/live` renders as empty (dash) even though `demoBattle.attacks` has 3 real attacks. The Cross Attack Round 2 matrix is completely non-functional on the demo route. The existing test (`components/attack-matrix.test.tsx`) only covers hyphenated actorIds and never exercises the underscore path, so this gap was never caught.

2. **components/battles-table.tsx:95** — Filter expression `row.winner?.name.toLowerCase().includes(normalizedQuery)` will throw `TypeError: Cannot read properties of undefined (reading 'toLowerCase')` when `row.winner` is `null`. The Canceled battle row #38 has `winner: null`. Typing any text into the search box crashes the filter loop, causing all five rows to disappear from the table instead of being filtered. The optional chaining (`?.`) only short-circuits the immediate `.name` access; the subsequent `.toLowerCase()` runs unconditionally on whatever the chain produced.

## Summary
- Criticals: 2
