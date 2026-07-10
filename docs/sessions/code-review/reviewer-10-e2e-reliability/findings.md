# Adversarial Review — E2E Spec Reliability

Date: 2026-07-10
Reviewer: reviewer-10-e2e-reliability

## CRITICAL

1. **tests/e2e/api-validators.spec.ts:38** — The "bad battle id" test accepts `[200, 400, 404]` as valid outcomes. A 200 means the guard is **not wired** — the test silently passes regardless of validation correctness. This completely defeats the purpose of a validator test. The test should fail (or skip with a loud warning) when the guard returns 200, not accept it as success.

2. **tests/e2e/api-validators.spec.ts:94-133** — The rate-limit test fires 12 sequential POST requests to `/api/battles` without resetting state between test runs. In CI with `workers: 2`, two parallel workers each firing 12 requests in parallel to the same in-memory rate-limit bucket will trigger 429s spuriously in unrelated tests that hit `/api/battles` afterward (notably `smoke-routes.spec.ts` which tests `/api/battles` and `example-battle.spec.ts` which hits `/api/battles/demo`). There is no `beforeEach` cleanup or rate-limit reset. The test poisons shared state for the entire run.

3. **tests/e2e/api-validators.spec.ts:120-125** — After the rate-limit loop completes, the test fires one more POST and asserts `expect(limitedResponse.status()).toBe(429)`. This second request is the 13th in the same window — it will hit the same rate-limit bucket and always return 429 regardless of whether the first 12 actually triggered the limit. The assertion is tautological: it always passes because it's the 13th request in a window of 10.

4. **tests/e2e/battle-setup.spec.ts:73-85** — The poll loop for Start Battle outcome uses `page.waitForTimeout(1000)` between checks (25 iterations = up to 25 seconds), and asserts on three valid outcomes (navigate, error, stuck). But the loop only checks `currentUrl` and `errorEl.isVisible()` — it does not wait for the network request to `/api/battles` to settle. If the POST is slow (e.g., 15s on cold compile), the click fires before the network handler is ready, and the loop exits at `i=25` throwing an error.

## HIGH

5. **tests/e2e/battle-live.spec.ts:26-30, battle-result.spec.ts:26-29, judge-scores.spec.ts:22-26, defense-round.spec.ts:25-29, export-markdown.spec.ts:64-66, agent-passport.spec.ts:29-43** — The pattern `for (let attempt = 0; attempt < 3; attempt++) { await page.goto(...); await page.waitForTimeout(2000); }` appears in **8+ spec files**. Each retry blindly sleeps 2 seconds regardless of whether the page has loaded. Under load, this wastes 4-6 seconds per test and can still miss the render. This is a classic anti-pattern — Playwright's `expect(locator).toBeVisible({ timeout: ... })` with a generous single timeout is more reliable than N retries with fixed sleeps.

6. **tests/e2e/example-battle.spec.ts:98-124** — The "network safety" test navigates only to `/` (the home page) and asserts no external API calls. The PRD §8.3 demo safety requirement is about the demo **battle** (`/battle/demo/live`, `/api/battles/demo/events`), not the landing page. The home page trivially makes no external calls. This test provides false confidence — it never exercises the SSE pipeline or the event store fetch that are the real external-call risk vectors.

7. **tests/e2e/home.spec.ts:35** — `await page.keyboard.press("Tab")` is used to test keyboard navigation, but this test runs on `chromium-mobile` and `webkit-mobile` projects with `isMobile: true, hasTouch: true`. On touch-only viewport configurations, `keyboard.press("Tab")` does not trigger DOM focus traversal in the same way as desktop. The assertion `expect(active).not.toBe("BODY")` will flake on mobile projects. This test should be desktop-only.

8. **playwright.config.ts:20-23** — `fullyParallel: true` with 4 projects (chromium-desktop, chromium-mobile, webkit-desktop, webkit-mobile) and `workers: 2` in CI means all 4 projects' tests run concurrently against a single `webServer` instance. The Next.js dev server has known port-binding issues under concurrent load (cold compile races). Combined with the 2s retry sleeps, CI wall-clock time will spike to 10+ minutes and flake rates will be >15%.

9. **tests/e2e/judge-scores.spec.ts:94** — `expect(title).toMatch(/Evidence:\s*ev_/)` targets a `title` attribute on `.score-cell`. CSS class targeting (`.score-cell`, `.score-tooltip`, `.total-cell strong`) throughout this file is fragile to any Tailwind class rename. If the design system renames `soft-pill` or `score-cell`, every test in this file breaks simultaneously with no actionable error message.

10. **tests/e2e/agent-passport.spec.ts:32, 55, 80, 94, 118, 144** — All 5 tests in this file check `page.locator(".passport-layout")` as the gate for "page rendered". If the layout class is renamed (e.g., from `passport-layout` to `passport-shell`), every test skips with the same message, and the "passport page renders" invariant is silently unverified. There is no fallback assertion that catches a partial render.

## MEDIUM

11. **tests/e2e/_fixtures/test.ts:16** — `SEED_BATTLE_ID = "hackathon-001"` is defined and the `gotoBattle` helper is exported, but **zero spec files use it**. Every spec hardcodes `page.goto("/battle/demo/...")`. The canonical seed id is duplicated across 8+ files as the literal string `"demo"`. If the demo id changes, every spec file must be updated.

12. **tests/e2e/battle-replay.spec.ts:22** — `page.getByRole("list", { name: /battle event timeline/i })` relies on the accessible name matching. If the timeline component renders before the `aria-label` is applied (React hydration race), the locator falls back to `<ul>`/`<ol>` role matching by structure, which can match unintended elements like navigation lists.

13. **tests/e2e/battle-replay.spec.ts:37** — `expect(count).toBeGreaterThanOrEqual(0)` is a tautological assertion. It always passes, including when the timeline is empty (API failure). This test passes even if the replay feature is completely broken.

14. **tests/e2e/api-validators.spec.ts:76** — `expect([201, 400]).toContain(status)` for invalid POST payloads accepts 201 (success) as valid. If the API silently accepts `idea: null` and `idea: ""`, the test passes. This is the same anti-pattern as the GET guard test — accepting failure as success.

15. **tests/e2e/smoke-routes.spec.ts:51-64** — The "API endpoints respond" test sends 4 GET requests in sequence without isolation. Combined with the rate-limit test in `api-validators.spec.ts` (12 POSTs), the total request count per CI worker is 16+ to `/api/battles*` endpoints in rapid succession. With 2 parallel workers, the rate-limit threshold of 10/60s is easily exceeded.

16. **tests/e2e/defense-round.spec.ts:85** — `page.locator("text=defense_created")` uses exact text matching for event type badges. If the badge renders as `defense_created` inside a React component that wraps it (e.g., `<span>event: defense_created</span>`), this locator still matches. But if the rendering changes to a tooltip, icon, or abbreviated form (`def_created`), the test silently finds zero elements and fails with no diagnostic about what event types were actually present.

17. **tests/e2e/judge-scores.spec.ts:103-128** — The "scores are ranked by total descending" test parses `textContent` as `parseFloat()` to extract scores. If the score renders with formatting (e.g., `"7.5 / 10"` or `"7.5 pts"`), `parseFloat` extracts only the leading number and the test may incorrectly pass with wrong data. There's no validation that the parsed number is the actual total.

18. **tests/e2e/battle-replay.spec.ts:107** — `page.getByRole("dialog").or(page.locator(".event-drawer"))` uses `.or()` which matches either, but if the event drawer renders as neither a `dialog` role nor has class `.event-drawer`, the test silently fails without indicating which assertion path was taken.

19. **tests/e2e/export-markdown.spec.ts:55-61** — "arbitrary battle id still succeeds (demo fallback)" test asserts that `/api/battles/any-id/export` returns 200. This is a **feature gap being tested as a feature**. The correct invariant is that arbitrary IDs should return 404, not 200. This test cements a bug as expected behavior and will block the fix when the guard is wired.

20. **playwright.config.ts:92** — `webServer.timeout: 60_000` (60 seconds) for `pnpm dev` to become ready. In CI with cold `pnpm install` + cold Next.js compile, the dev server frequently takes 90-120 seconds to become responsive. The 60s timeout will cause the entire e2e job to fail before any test runs, masking actual test failures.

## Summary

- Critical: 4
- High: 6
- Medium: 10
- Most fragile spec: **api-validators.spec.ts** — accepts guard failures as valid outcomes (lines 38, 76), has a tautological rate-limit assertion (lines 120-125), and pollutes shared rate-limit state for all other tests.
- Coverage gaps:
  - No viewport meta tag test (mobile rendering depends on `<meta name="viewport">`)
  - No touch event simulation test (tap vs click on mobile)
  - No WebKit-specific rendering test (font fallback, scroll behavior)
  - No SSE reconnection test (the live page connects to SSE — what happens on disconnect?)
  - No test data cleanup verification (tests assume "demo" battle exists; no teardown)
  - No test for `/agent/[id]/passport` with an invalid agent id (should 404, not 200)
  - No test for concurrent battle creation (race condition in battle ID generation)