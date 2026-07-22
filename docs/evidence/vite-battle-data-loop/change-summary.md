# Vite Battle Data Loop

## Scope

- Added the Hono battle-events endpoint with Event Store first, deterministic fixture fallback behavior.
- Added the Vite battle event loader with client-side fallback when the API is unavailable.
- Added unified Live, Result, and Replay states under `/battle/:battleId`.
- Added rule-based commentary and a progressively revealed Evidence Chain.
- Kept the Battle Engine, round state machine, and scoring implementation unchanged.

## Failure path

- Postgres/Event Store read failure returns an empty fallback response instead of failing the battle request.
- The browser converts an empty/error response to the deterministic Example Battle event chain.
- Commentary is local and rule-based; it cannot delay battle progress.

