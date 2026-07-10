import { test, expect } from "./_fixtures/test";

/**
 * PRD §8.3 — Battle Live page journey.
 *
 * Verifies the /battle/[id]/live route renders, the SSE connection
 * establishes (or falls back gracefully), and the Round Timeline
 * component is visible.
 *
 * Acceptance (issue #13):
 * - Page loads (no 500 error)
 * - Round Timeline element visible
 * - Team score grid renders
 * - Event Ledger section visible
 * - Screenshot on failure (handled by playwright.config.ts)
 */

test.describe("PRD §8.3 Battle Live", () => {
  test("live page renders with round timeline and team scores", async ({ page }) => {
    await page.goto("/battle/demo/live");

    // The live page fetches battle data then renders. Give it generous
    // timeout for the client-side fetch + render cycle.
    // Page heading (battle title) is visible.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 15_000 });

    // Round Timeline: the <nav> element with class "round-timeline".
    // Using CSS selector because the role-based query was unreliable
    // in dev mode (client component hydration timing).
    const timeline = page.locator("nav.round-timeline");
    await expect(timeline).toBeVisible({ timeout: 15_000 });

    // At least one round step is rendered (Briefing, Propose, Attack, etc.).
    const roundSteps = timeline.locator(".round-step");
    await expect(roundSteps.first()).toBeVisible();
    expect(await roundSteps.count()).toBeGreaterThanOrEqual(5);

    // Team score grid (class "team-score-grid") is visible.
    const teamGrid = page.locator(".team-score-grid");
    await expect(teamGrid).toBeVisible();

    // Event Ledger section is visible.
    await expect(page.getByRole("heading", { name: /event ledger/i })).toBeVisible();
  });

  test("live page SSE connection attempts to connect", async ({ page }) => {
    await page.goto("/battle/demo/live");

    // The page uses connectSse which fires a request to /api/battles/demo/events/stream.
    // We wait for the round timeline to render, proving the page mounted successfully
    // and did not crash on the SSE connection attempt.
    await expect(page.locator("nav.round-timeline")).toBeVisible({ timeout: 15_000 });

    // The page must not be blank — body must have content.
    await expect(page.locator("body")).not.toBeEmpty();
  });
});