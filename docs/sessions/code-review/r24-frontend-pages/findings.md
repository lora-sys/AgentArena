# R24 Frontend Pages

Date: 2026-07-10

## CRITICAL

1. **app/agent/viral-designer/passport/page.tsx:111,123** — Evidence links use query param `?event=` while the dynamic route `app/agent/[id]/passport/page.tsx:421,433` uses `?attack=`. The two pages are supposed to stay in sync (stated in the static page's own comment at line 18), but they emit different query parameters. Whichever format the replay page reads, one of the two pages produces broken links.

2. **app/agent/viral-designer/passport/page.tsx:111,123 + app/agent/[id]/passport/page.tsx:421,433** — Evidence links from passport pages (`/battle/{battleId}/replay?attack={id}` / `?event={id}`) are dead links. The replay page (`components/battle-replay-client.tsx`) never reads query parameters — `useSearchParams` is absent and `selectedEventId` is only set by onClick handlers. Clicking any evidence link navigates to the replay page but does not open or highlight the referenced event, breaking the core PRD invariant that passport evidence must link to source events.

## Summary
- Criticals: 2