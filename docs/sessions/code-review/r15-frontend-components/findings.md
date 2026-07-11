# R15 Frontend Components

Date: 2026-07-10

## CRITICAL

1. components/live-battle-client.tsx:188 — `TOTAL_ROUNDS` is hardcoded to 6. The `RoundProgressBar` receives `currentRound` from the API but always divides by 6. If the battle has a different round count (e.g. 4-round format), the progress bar and "Round X of Y" label are mathematically wrong (e.g. round 3 of 4 shows as "Round 3 of 6" with 50% fill instead of 75%). `progressPct` in `round-progress-bar.tsx:42` clamps to `totalRounds` so the bar caps at 100% mid-battle. The correct totalRounds must come from the status API.

2. components/battle-replay-client.tsx:113,133,152 — `<AppShell currentRound="cross_attack">` is hardcoded in all three render branches (loading, error, ready). The `BattleRail` sidebar in `app-shell.tsx:61-89` uses this value to mark which round step is active. This means the battle-rail navigation always shows "Cross Attack" as the active round regardless of what round the battle actually reached. The actual current round should be derived from the last event in the event timeline (e.g. `events[events.length - 1]?.round`), or passed as a prop from the page.

3. components/live-battle-client.tsx:126-128 — The `setTimeout` that sets `status: "open"` after 100ms is not cancelled when `onConnectionError` fires. If the SSE connection errors synchronously or before 100ms, the error callback dispatches `status: "reconnecting"`, then the stale timer overwrites it with `status: "open"`. Result: the UI shows "connected" on a broken stream. The `openTimer` reference must be stored and cleared in the `onConnectionError` path.

4. components/replay-controls.tsx:14-16 — The play interval never stops at 100% and loops progress (`value >= 96 ? 12 : value + 2`). After ~33 seconds of playback, the progress visually jumps from ~96% back to 12% in a single tick, and the user has no way to know the replay is "done". There is no condition that transitions `playing` back to `false` when the replay reaches the end. The loop should either stop at 100, or expose a completion state.

5. components/live-battle-client.tsx:166-171 — The elapsed-second interval has `[]` as its dependency array, so it is never torn down when `battleId` changes. `startedAtRef.current` is updated on every battleId change via the SSE effect (line 106), so the math is correct, BUT the interval itself accumulates one timer per historical battleId change without ever clearing prior ones. On long-lived pages with navigations, multiple intervals stack. The effect must depend on `battleId` or use a single ref-tracked interval.

## Summary
- Criticals: 5
