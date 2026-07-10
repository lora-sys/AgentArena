import { test, expect } from "./_fixtures/test";

/**
 * PRD §8.3 Live Battle — Live page with agent status cards.
 *
 * Verifies the /battle/[id]/live route renders the round progress bar
 * and the 3 agent status cards. Uses battle-42 (static complete state
 * per status API) — NOT /battle/demo/live which has its own dedicated
 * page.tsx that renders a different static layout.
 *
 * Per docs/test-guidelines.md §3.4: one journey file per user-visible flow.
 * Per docs/test-guidelines.md §5.1: each journey runs in the viewport matrix
 * defined in playwright.config.ts (desktop + mobile).
 *
 * Note: LiveBattleClient is a client component that fetches status via SWR.
 * Tests wait for the SWR-polled data to populate the cards (data-team
 * attribute) before asserting state-dependent content.
 */

test.describe("PRD §8.3 Live Battle — agent status cards", () => {
  test("live page renders round progress bar and 3 agent cards", async ({
    page,
  }) => {
    // battle-42 has static complete state — deterministic for assertions.
    await page.goto("/battle/battle-42/live", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    // Round progress bar must be present (section with aria-label).
    const progressBar = page.locator('[aria-label="Round progress"]');
    await expect(progressBar).toBeVisible();

    // 3 agent status cards in the grid — one per contestant team.
    const cards = page.locator(".agent-status-card");
    await expect(cards).toHaveCount(3, { timeout: 10_000 });
  });

  test("battle-42 cards all show complete state with scores", async ({
    page,
  }) => {
    await page.goto("/battle/battle-42/live", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    // Static fixture: 3 teams all in 'complete' state.
    const cards = page.locator(".agent-status-card");
    await expect(cards).toHaveCount(3, { timeout: 10_000 });

    for (let i = 0; i < 3; i++) {
      const card = cards.nth(i);
      await expect(card).toHaveAttribute("data-state", "complete");
    }

    // Each complete card must show its score.
    const scores = page.locator(".agent-status-score");
    await expect(scores).toHaveCount(3);
  });

  test("round progress bar shows round 6 of 6 for complete battle", async ({
    page,
  }) => {
    await page.goto("/battle/battle-42/live", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    // battle-42 is at round 6 (final judging round) per status API.
    const label = page.locator(".round-progress-bar-label");
    await expect(label).toContainText("Round 6 of 6", { timeout: 10_000 });
  });

  test("cancel button is hidden when canCancel is false", async ({ page }) => {
    await page.goto("/battle/battle-42/live", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    // canCancel: false → cancel button must not render.
    const cancelBtn = page.locator(".round-progress-bar-cancel");
    await expect(cancelBtn).toHaveCount(0, { timeout: 10_000 });
  });

  test("event log section is present with heading", async ({ page }) => {
    await page.goto("/battle/battle-42/live", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    // The skip-link target and section heading must exist.
    const eventLog = page.locator("#event-log");
    await expect(eventLog).toBeVisible({ timeout: 10_000 });
    await expect(eventLog.locator("h2")).toContainText("Event Timeline");
  });
});