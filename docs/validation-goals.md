# Validation Goals

## Purpose

Use this document to decide whether the MVP works. It defines measurable product, technical, and demo gates.

Do not use it as a feature list; use [mvp-spec.md](mvp-spec.md). Do not use it to decide build order; use [development-plan.md](development-plan.md). Do not use it to debug failures; use [debugging-manual.md](debugging-manual.md).

## MVP Validation Question

Can Agent Arena make a messy idea feel battle-tested, more credible, and more memorable than asking one AI assistant?

## Product Gates

- User can explain the product in one sentence after seeing the first screen.
- User can start from a messy idea without configuring agents manually.
- User sees three distinct team strategies.
- User sees disagreement, not just three parallel answers.
- User sees why the champion won.
- User can open Replay and understand the battle path.
- User can open Passport and understand the reputation seed.

## Technical Gates

- Battle flow is controlled by code.
- Agent output is schema-validated.
- Score totals are calculated by code.
- Every critical round writes an event.
- Replay is generated from events.
- Passport is generated from events, scores, and claims.
- Markdown export is deterministic for the same battle data.
- Live model failure has a fallback.

## Demo Gates

- Demo starts in one command.
- Seeded battle is available without network or model calls.
- Live battle completes three consecutive runs.
- Median battle duration is 2 to 5 minutes.
- At least four artifacts are generated.
- At least five screenshot moments are visible.
- No route shows broken placeholders during the judged demo path.
- Browser automation screenshots are retained with a manifest under `artifacts/e2e/`.

## Failure Thresholds

The MVP is not ready if:

- The judge cannot tell why the winner won.
- Battle output reads like a normal chatbot answer.
- A model can decide the round order.
- Replay includes claims not present in the event log.
- Passport includes reputation facts not supported by current battle data.
- Startup requires undocumented manual steps.
