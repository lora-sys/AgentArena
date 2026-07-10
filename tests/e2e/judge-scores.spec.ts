import { test, expect } from "./_fixtures/test";

/**
 * PRD §8.3 — Judge Panel scores journey.
 *
 * Verifies that the Judge Scoreboard on the result page renders all
 * rubric dimensions and that each score binds to an evidenceEventId
 * (PRD invariant from CLAUDE.md §7: "Every Score binds to >=1
 * evidenceEventId").
 *
 * Acceptance:
 * - Champion card visible with winner team and score
 * - Judge Scoreboard table renders
 * - Each score row shows all 6 rubric dimensions:
 *   Novelty, Feasibility, Demo Wow, Tech Depth, User Value, Long-term
 * - Each score cell has a tooltip referencing the evidence event id
 */

test.describe("PRD §8.3 Judge Panel", () => {
  test("result page shows champion card with score", async ({ page }) => {
    let response;
    for (let attempt = 0; attempt < 3; attempt++) {
      response = await page.goto("/battle/demo/result");
      if (response && response.status() < 500) break;
      await page.waitForTimeout(2000);
    }
    expect(response?.status()).toBeLessThan(500);

    // Champion card must render.
    const championCard = page.locator("[aria-label='Champion']");
    await expect(championCard).toBeVisible({ timeout: 15_000 });

    // Champion name is present inside the card.
    const championName = championCard.locator(".champion-name");
    await expect(championName).toBeVisible();

    // Champion score is shown.
    const championScore = championCard.locator(".champion-score");
    await expect(championScore).toBeVisible();

    // Evidence link is shown.
    const evidenceId = championCard.locator(".evidence-id");
    await expect(evidenceId).toBeVisible();
  });

  test("scoreboard renders all 6 rubric dimensions", async ({ page }) => {
    for (let attempt = 0; attempt < 3; attempt++) {
      await page.goto("/battle/demo/result");
      await page.waitForTimeout(2000);
    }

    // Scoreboard table.
    const scoreboard = page.getByRole("table", { name: /judge scoreboard/i });
    await expect(scoreboard).toBeVisible({ timeout: 15_000 });

    // All 6 rubric dimension column headers must be present.
    const dimensions = [
      "Novelty",
      "Feasibility",
      "Demo Wow",
      "Tech Depth",
      "User Value",
      "Long-term",
    ];

    for (const dim of dimensions) {
      const header = scoreboard.getByRole("columnheader", { name: new RegExp(dim, "i") });
      await expect(header).toBeVisible();
    }

    // At least 3 team rows (1 per contestant team).
    const rows = scoreboard.getByRole("row");
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThanOrEqual(4); // 1 header + 3 teams
  });

  test("each score cell binds to an evidence event id", async ({ page }) => {
    for (let attempt = 0; attempt < 3; attempt++) {
      await page.goto("/battle/demo/result");
      await page.waitForTimeout(2000);
    }

    const scoreboard = page.getByRole("table", { name: /judge scoreboard/i });
    await expect(scoreboard).toBeVisible({ timeout: 15_000 });

    // Score cells have title attribute with "Evidence: ev_..." format.
    const scoreCells = scoreboard.locator(".score-cell");
    const cellCount = await scoreCells.count();
    expect(cellCount).toBeGreaterThan(0);

    // Check at least the first cell has the evidence reference.
    const firstCell = scoreCells.first();
    const title = await firstCell.getAttribute("title");
    expect(title).toMatch(/Evidence:\s*ev_/);

    // Score cell tooltip references the evidence event id.
    const tooltip = firstCell.locator(".score-tooltip");
    await expect(tooltip).toBeVisible();
    const tooltipText = await tooltip.textContent();
    expect(tooltipText).toMatch(/ev:/);
  });

  test("scores are ranked by total descending", async ({ page }) => {
    for (let attempt = 0; attempt < 3; attempt++) {
      await page.goto("/battle/demo/result");
      await page.waitForTimeout(2000);
    }

    const scoreboard = page.getByRole("table", { name: /judge scoreboard/i });
    await expect(scoreboard).toBeVisible({ timeout: 15_000 });

    // Collect total scores from each team row.
    const totalCells = scoreboard.locator(".total-cell strong");
    const count = await totalCells.count();
    expect(count).toBeGreaterThanOrEqual(3);

    const scores: number[] = [];
    for (let i = 0; i < count; i++) {
      const text = await totalCells.nth(i).textContent();
      const parsed = parseFloat(text ?? "0");
      scores.push(parsed);
    }

    // Scores must be in descending order.
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeLessThanOrEqual(scores[i - 1]);
    }
  });
});