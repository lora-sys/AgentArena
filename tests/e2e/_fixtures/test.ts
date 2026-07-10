import { test as base, expect, type Page } from "@playwright/test";

/**
 * Base fixture for Agent Arena E2E journeys.
 *
 * Wraps Playwright's `page` with helpers that are shared across
 * every journey: a deterministic SSE injector stub, a battle-id
 * nav helper, and the canonical seeded fixture id used by the
 * example journeys per docs/test-guidelines.md §9.1.
 *
 * Individual journeys extend this with their own fixtures (e.g.
 * a live battle page object) — see test-guidelines.md §5.1 for
 * the journey structure that consumes these helpers.
 */

export const SEED_BATTLE_ID = "hackathon-001";

export type TestFixtures = {
  page: Page;
  /** Navigate to a battle route using the canonical seed id. */
  gotoBattle: (route: string) => Promise<void>;
};

export const test = base.extend<TestFixtures>({
  page: async ({ page }, use) => {
    // Each journey starts with the Storybook-independent page;
    // visual checks against Storybook live in a separate matrix
    // (see docs/test-guidelines.md §6 — agent-browser owns those).
    await use(page);
  },

  gotoBattle: async ({ page }, use) => {
    await use(async (route: string) => {
      const path = route.startsWith("/") ? route : `/${route}`;
      await page.goto(`/battle/${SEED_BATTLE_ID}${path}`);
    });
  },
});

export { expect };
