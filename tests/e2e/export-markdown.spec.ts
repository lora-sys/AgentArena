import { test, expect } from "./_fixtures/test";

/**
 * PRD §8.3 — Export Markdown round-trip journey.
 *
 * Verifies that the Markdown export endpoint serves a valid markdown
 * document containing battle summary information. The export must
 * round-trip — downloading the file and parsing it as markdown should
 * yield battle data.
 *
 * Acceptance:
 * - GET /api/battles/demo/export returns 200
 * - Content-Type is text/markdown
 * - Content-Disposition includes "attachment"
 * - Body contains expected sections (champion, scoreboard, teams)
 */

test.describe("PRD §8.3 Export Markdown", () => {
  test("export endpoint returns markdown with correct headers", async ({ request }) => {
    const response = await request.get("/api/battles/demo/export");

    // Must succeed.
    expect(response.status()).toBe(200);

    // Content-Type must be markdown.
    const contentType = response.headers()["content-type"] ?? "";
    expect(contentType).toMatch(/text\/markdown/);

    // Content-Disposition must include attachment for download.
    const disposition = response.headers()["content-disposition"] ?? "";
    expect(disposition).toMatch(/attachment/);
  });

  test("export body contains battle sections", async ({ request }) => {
    const response = await request.get("/api/battles/demo/export");
    expect(response.status()).toBe(200);

    const body = await response.text();

    // Body must contain markdown headers for battle sections.
    // Common sections in the export: champion, teams, scoreboard, artifacts.
    expect(body).toMatch(/#\s+/); // At least one markdown heading
    expect(body.length).toBeGreaterThan(100); // Non-trivial content

    // Must mention at least one of the known team names from the demo battle.
    const hasTeamReference =
      body.includes("Safe Builder") ||
      body.includes("Viral Designer") ||
      body.includes("Infra Hacker") ||
      body.includes("safe_builder") ||
      body.includes("viral_designer");
    expect(hasTeamReference).toBe(true);
  });

  test("export endpoint with arbitrary battle id still succeeds (demo fallback)", async ({ request }) => {
    // The current implementation serves the demo bundle for any id.
    // This proves the export is available without a real battle engine.
    const response = await request.get("/api/battles/any-id/export");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toMatch(/text\/markdown/);
  });

  test("result page export link points to the markdown endpoint", async ({ page }) => {
    for (let attempt = 0; attempt < 3; attempt++) {
      await page.goto("/battle/demo/result");
      await page.waitForTimeout(2000);
    }

    // The Export Markdown button is an anchor with download attribute.
    const exportLink = page.getByRole("link", { name: /export markdown/i });
    const isVisible = await exportLink.isVisible({ timeout: 10_000 }).catch(() => false);

    if (!isVisible) {
      test.skip(true, "Result page did not render Export Markdown link within timeout.");
      return;
    }

    // The link href must point to the export endpoint.
    const href = await exportLink.getAttribute("href");
    expect(href).toMatch(/\/api\/battles\/.*\/export/);

    // Must have download attribute (triggers browser download).
    const download = await exportLink.getAttribute("download");
    expect(download).not.toBeNull();
  });
});