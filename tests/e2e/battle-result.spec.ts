import { test, expect } from "./_fixtures/test";

/**
 * PRD §8.3 — Battle Result page journey.
 *
 * Verifies the /battle/[id]/result route renders, the Champion card
 * is visible, and the Judge Scoreboard is displayed.
 *
 * Acceptance (issue #13):
 * - Page loads (no 500 error)
 * - Champion card visible
 * - Scoreboard section visible
 * - Screenshot on failure (handled by playwright.config.ts)
 */

test.describe("PRD §8.3 Battle Result", () => {
  test("result page renders champion card and scoreboard", async ({ page }) => {
    await page.goto("/battle/demo/result");

    // The result page fetches /api/battles/demo/result via fetchBattleResult.
    // Give it generous timeout for the client-side fetch + render cycle.
    // Champion card (aria-label="Champion") must become visible.
    const championCard = page.locator("[aria-label='Champion']");
    await expect(championCard).toBeVisible({ timeout: 20_000 });

    // Champion label is present.
    await expect(page.getByText(/^Champion$/)).toBeVisible();

    // Judge Scoreboard section.
    await expect(page.getByRole("heading", { name: /judge scoreboard/i })).toBeVisible();

    // Scoreboard table is present (role="table").
    const scoreboard = page.getByRole("table", { name: /judge scoreboard/i });
    await expect(scoreboard).toBeVisible();

    // At least 4 scoreboard rows (header + 3 teams).
    const rows = scoreboard.getByRole("row");
    expect(await rows.count()).toBeGreaterThanOrEqual(4);
  });
});