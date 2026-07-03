# Debugging Manual

## Purpose

Use this document when the app, battle flow, agent output, replay, export, or startup path is broken.

Do not use it to decide what to build next; use [development-plan.md](development-plan.md). Do not use it to decide whether the MVP is ready; use [validation-goals.md](validation-goals.md). Do not use it for historical postmortems; use [failure-archaeology.md](failure-archaeology.md).

## First Command

```bash
./scripts/doctor.sh
```

If a Next.js app exists:

```bash
./scripts/start.sh
```

## Diagnosis Order

1. Reproduce the smallest failing path.
2. Identify whether it is UI, Battle Engine, agent adapter, schema, event log, export, or startup.
3. Inspect the event log before trusting rendered UI.
4. Check schema validation before changing prompts.
5. Check deterministic scoring before changing judge text.
6. Add a fixture that reproduces the failure.
7. Fix the smallest contract violation.
8. Re-run doctor and the affected route/test.

## Common Failures

### Battle gets stuck

Likely causes:

- Missing state transition.
- Agent adapter never returns.
- Invalid output failed repair and no fallback fired.

Check:

- Current `BattleStatus`.
- Last event type.
- Adapter timeout.
- Retry count.

### Scoreboard contradicts winner

Likely causes:

- Judge prose names a winner different from calculated score.
- We trusted model total instead of code total.

Fix:

- Code-calculated total wins.
- Judge text must be repaired or displayed as comment, not authority.

### Replay invents events

Likely causes:

- Replay generator summarizes from final artifacts.
- Missing event filtering.

Fix:

- Replay reads only event log and normalized battle entities.

### Passport overclaims reputation

Likely causes:

- Single-battle snapshot uses long-term fields.
- Placeholder treated as fact.

Fix:

- Mark future reputation as placeholder until cross-battle data exists.

### UI looks generic

Likely causes:

- Cards were implemented without the battle metaphor.
- Timeline/replay/champion surfaces were postponed.

Fix:

- Re-check [ui-react-bits.md](ui-react-bits.md) and screenshot moments.

## Debugging Rules

- Do not debug prompts before validating schemas.
- Do not debug UI before checking source data.
- Do not add retries without logging the failed payload.
- Do not hide failures behind loading states.
- Do not fix a fixture by changing the expected product contract silently.
