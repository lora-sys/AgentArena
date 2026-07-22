# Test guidelines

Test public behavior and durable contracts, not component internals.

## Required layers

- Engine/runtime/schema/store unit tests remain under `arena/`, `lib/`, `agents/`, and `examples/`.
- API contract tests live beside `apps/api/src/app.ts`.
- Web data/reducer tests live under `apps/web/src`.
- Chromium desktop/mobile browser journeys live under `tests/e2e` and cover only the four supported routes. Safari/WebKit parity is a manual compatibility check until a stable CI runner is added.

## Release gate

Run `pnpm typecheck && pnpm lint && pnpm test && pnpm build && pnpm e2e`. Then visually inspect desktop and 390px layouts and run `/battle/demo` three consecutive times.

Good tests verify event insertion order, `attackId + acceptedAttack` damage linkage, deterministic fallback behavior, evidence-bound Passport output, route navigation, and absence of page-level mobile overflow. Avoid snapshotting implementation markup or timer internals.

Generated coverage, Playwright reports, and test-results are ignored and must not be committed.
