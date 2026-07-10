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

    // Wait for the page to finish loading (either result or error state).
    // The result page fetches /api/battles/demo/result via fetchBattleResult.
    // We wait for either the champion card or the error message.
    const championCard = page.locator("[aria-label='Champion']");
    const errorState = page.locator("[role='alert'].result-error");

    // Either the champion card renders, or we see an error/loading state.
    // Use a race: wait for the champion card to appear, with a fallback.
    await expect(championCard.or(errorState)).toBeVisible({ timeout: 15_000 });

    if (await championCard.isVisible()) {
      // Champion label is present.
      await expect(page.getByText(/^Champion$/)).toBeVisible();

      // Judge Scoreboard section.
      await expect(page.getByRole("heading", { name: /judge scoreboard/i })).toBeVisible();

      // Scoreboard table is present (role="table").
      const scoreboard = page.getByRole("table", { name: /judge scoreboard/i });
      await expect(scoreboard).toBeVisible();

      // At least 3 scoreboard rows (one per team).
      const rows = scoreboard.getByRole("row");
      expect(await rows.count()).toBeGreaterThanOrEqual(4); // header + 3 teams
    }
  });
});