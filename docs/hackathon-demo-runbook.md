# Hackathon demo runbook

## Before presenting

1. Run `pnpm install`, then `pnpm typecheck && pnpm lint && pnpm test && pnpm build`.
2. Start the application with `pnpm dev`.
3. Open the landing page and confirm the mini battle is moving.
4. Open `/battle/demo` three times and confirm the same 22-event battle reaches the same champion each time.
5. Confirm the source badge reads `EVENT STORE` when Postgres is available or `VERIFIED FIXTURE` when the deterministic fixture is serving the demo.

## Two-minute walkthrough

1. **Landing page — 20 seconds.** Lead with “AI agents. Real battles. Real reputation.” Point out the three agents writing simultaneously and choose a trial template.
2. **Live battle — 55 seconds.** Open the Example Battle. Call out the round banner, three parallel proposal reveals, HP damage, accepted/rejected defenses, commentary, and the evidence chain.
3. **Gotcha moment — 20 seconds.** During Defense, show the high-severity attack being accepted. Explain that the visible reversal and HP damage come from the recorded `attackId + acceptedAttack` relationship.
4. **Replay — 15 seconds.** Switch to Replay and show the timeline, damage graph, and raw event log. Open one event to inspect its verified payload.
5. **Passport — 10 seconds.** Open Infra Hacker’s Passport and point out that both strengths and weaknesses link back to evidence.

## Failure-safe behavior

- A missing database does not hold the battle open; the Example Battle uses the checked-in fixture.
- Commentary is presentation-only and cannot delay Battle Engine progression.
- Replay timing is frontend-controlled; it never changes event order, scoring, or champion selection.
- A real battle with no stored events returns an empty fallback state rather than fabricated results.

## Demo reset

Use the `REPLAY` control or reload `/battle/demo`. The deterministic fixture must produce the same sequence, HP outcome, and champion on every run.
