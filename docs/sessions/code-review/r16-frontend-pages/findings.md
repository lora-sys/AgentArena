# R16 Frontend Pages

Date: 2026-07-10

## CRITICAL

1. **app/agent/[id]/passport/page.tsx:283-297** — Infinite loading skeleton on API 404. When `loadAgentPassport()` returns `null` (API returns 404 or network error for any agent ID other than `"demo"`), the page checks `id === "not-found"` to decide whether to show the "not found" SectionCard. Since real URL params are agent IDs (e.g. `"safe-builder"`), the sentinel `"not-found"` never matches, and the page renders `<PassportSkeleton />` forever instead of an error state. User sees an indefinite loading spinner for any non-existent agent.

## Summary
- Criticals: 1