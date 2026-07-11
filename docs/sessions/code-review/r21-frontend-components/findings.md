# R21 Frontend Components

Date: 2026-07-10

## CRITICAL

1. components/battle-replay-client.tsx:78-87 — ResizeObserver effect has `[status]` dependency but the effect body uses `scrollContainerRef.current ?? containerRef.current`. When status flips from "loading" to "ready", the observer is destroyed and recreated. During the transition window, `containerRef.current` may still reference a DOM node from the unmounted loading state. The fallback (`?? containerRef.current`) can observe a stale or detached node, producing `ResizeObserver loop completed with undelivered notifications` warnings and incorrect `viewportHeight` that over-renders or under-renders the virtualized event list.

2. components/attack-matrix.tsx:25-30 — `cellAttacksFor` calls `from.replace(/_/g, "-")` on `ATTACKER_TEAMS` constant IDs (`"safe_builder"`, `"viral_designer"`, `"infra_hacker"`) to produce hyphenated form for comparison. However, the internal `TeamId` type (lib/types.ts:1-6) uses hyphenated IDs (`"safe-builder"`, `"viral-designer"`, `"infra-hacker"`), and the live-battle-client TEAMS array (live-battle-client.tsx:31-35) also uses hyphenated IDs. The conversion direction is correct for API events but silently drops any attack where `actorId`/`targetId` arrives in underscore format — the matrix renders an empty grid with no error. This is a silent data-loss bug for any data source that uses underscore-format IDs.

3. components/header-actions.tsx:55-64,194 — The `login` function is passed as `action={login}` on a `<form>` element but is declared as a synchronous non-async function returning void. In React 19, form actions that are not async or do not return a Promise will cause a full page navigation on submit (React cannot keep the submission in a transition without a thenable), destroying all client state including the dialog, user session, and any unsaved form data.

## Summary
- Criticals: 3