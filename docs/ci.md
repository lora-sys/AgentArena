# Continuous integration

CI installs the pnpm workspace and runs typecheck, lint, unit tests, build, and Playwright journeys. The Vite web app listens on 5188 and proxies API requests to the Hono service on 8787.

Build artifacts are generated in `apps/web/dist` and are never committed. E2E results belong in ignored report directories and may be uploaded by CI as artifacts.

The gate is green only when all current-route checks pass; stale Next.js routes, port 3000, and Storybook are not part of the current pipeline.
