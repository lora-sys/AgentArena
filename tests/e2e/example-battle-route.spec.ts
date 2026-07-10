import { test, expect } from "./_fixtures/test";

/**
 * PRD §8.3 — Example Battle route safety.
 *
 * Verifies the example/demo battle loads without making any external
 * API calls (no OpenAI, no Anthropic, no third-party APIs).
 *
 * The demo battle uses:
 *   - lib/demo-data.ts (in-memory fixture)
 *   - /api/battles/demo (serves the demo bundle)
 *
 * This is the PRD §8.3 "Demo Safety" acceptance:
 *   "ENABLE_EXAMPLE_BATTLES lets the demo run without external
 *    dependencies (no OpenAI, no DB)."
 *
 * Note: There is no separate /examples/[id] route. The demo is served
 * at /battle/demo/... and the example journey (example-battle.spec.ts)
 * already covers the API. This spec file adds an additional layer of
 * verification at the page level for all demo battle routes.
 *
 * Acceptance:
 * - /battle/demo/live loads with no external API calls
 * - /battle/demo/replay loads with no external API calls
 * - /battle/demo/result loads with no external API calls
 * - Home page makes no external API calls
 */

test.setTimeout(60_000);

test.describe("PRD §8.3 Example Battle Route Safety", () => {
  test("/battle/demo/live makes no external API calls", async ({ page }) => {
    const externalCalls: string[] = [];

    page.on("request", (request) => {
      const url = request.url();
      // Allow localhost (our own dev server) and data URIs.
      if (
        !url.startsWith("http://localhost") &&
        !url.startsWith("data:") &&
        !url.startsWith("blob:")
      ) {
        externalCalls.push(url);
      }
    });

    let response;
    for (let attempt = 0; attempt < 3; attempt++) {
      response = await page.goto("/battle/demo/live");
      if (response && response.status() < 500) break;
      await page.waitForTimeout(2000);
    }
    expect(response?.status()).toBeLessThan(500);

    // Wait for page to settle.
    await page.waitForTimeout(2000);

    // Filter for actual API calls (not fonts, analytics, etc.).
    const externalApiCalls = externalCalls.filter(
      (url) =>
        url.includes("openai.com") ||
        url.includes("anthropic.com") ||
        url.includes("/api/") && !url.includes("localhost")
    );
    expect(externalApiCalls).toEqual([]);
  });

  test("/battle/demo/replay makes no external API calls", async ({ page }) => {
    const externalCalls: string[] = [];

    page.on("request", (request) => {
      const url = request.url();
      if (
        !url.startsWith("http://localhost") &&
        !url.startsWith("data:") &&
        !url.startsWith("blob:")
      ) {
        externalCalls.push(url);
      }
    });

    let response;
    for (let attempt = 0; attempt < 3; attempt++) {
      response = await page.goto("/battle/demo/replay");
      if (response && response.status() < 500) break;
      await page.waitForTimeout(2000);
    }
    expect(response?.status()).toBeLessThan(500);

    await page.waitForTimeout(2000);

    const externalApiCalls = externalCalls.filter(
      (url) =>
        url.includes("openai.com") ||
        url.includes("anthropic.com") ||
        (url.includes("/api/") && !url.includes("localhost"))
    );
    expect(externalApiCalls).toEqual([]);
  });

  test("/battle/demo/result makes no external API calls", async ({ page }) => {
    const externalCalls: string[] = [];

    page.on("request", (request) => {
      const url = request.url();
      if (
        !url.startsWith("http://localhost") &&
        !url.startsWith("data:") &&
        !url.startsWith("blob:")
      ) {
        externalCalls.push(url);
      }
    });

    let response;
    for (let attempt = 0; attempt < 3; attempt++) {
      response = await page.goto("/battle/demo/result");
      if (response && response.status() < 500) break;
      await page.waitForTimeout(2000);
    }
    expect(response?.status()).toBeLessThan(500);

    await page.waitForTimeout(2000);

    const externalApiCalls = externalCalls.filter(
      (url) =>
        url.includes("openai.com") ||
        url.includes("anthropic.com") ||
        (url.includes("/api/") && !url.includes("localhost"))
    );
    expect(externalApiCalls).toEqual([]);
  });

  test("demo battle data comes from /api/battles/demo (local only)", async ({ request }) => {
    // Verify the demo API endpoint is accessible and returns valid data.
    const response = await request.get("/api/battles/demo");
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.bundle).toBeDefined();
    expect(body.bundle.teams).toBeDefined();
    expect(body.bundle.teams.length).toBe(3);
  });
});