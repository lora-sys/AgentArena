# R11 Frontend Components

Date: 2026-07-10

## CRITICAL

1. `components/event-drawer.tsx:98-105` — Focus is not restored when drawer closes. The `useEffect` at line 98-105 only runs the focus-restoration cleanup when `open` transitions from `true` to `false`, but the effect body has an early return at line 99 (`if (!open) return;`), so no cleanup is registered for the "open" run. When the drawer closes (open goes from `true` to `false`), the effect body early-returns without registering a cleanup — meaning `previousFocusRef.current?.focus()` (line 103) never executes. This is an a11y violation: focus is trapped or lost on the drawer's close button instead of returning to the element that opened the drawer.

2. `components/battle-replay-client.tsx:77-86` — `ResizeObserver` observes the wrong DOM element. The effect at line 77-86 depends on `status` and runs when status changes from `"loading"` to `"ready"`. At that point `scrollContainerRef.current` references the **loading placeholder** div (rendered at line 117-123), not the actual scroll container (line 157-163). When status transitions to `"ready"`, the old element unmounts and a new one mounts — the ResizeObserver was set on the old (now removed) element. The new scroll container is never observed, so `viewportHeight` stays at `DEFAULT_VIEWPORT_HEIGHT` (600px) even if the container is taller. This causes the virtual list to under-render rows in containers larger than 600px.

3. `components/attack-matrix.tsx:19-28` — Team ID format mismatch causes empty matrix. `ATTACKER_TEAMS` uses underscore IDs (`safe_builder`, `viral_designer`, `infra_hacker`), but the actual event data from the API uses hyphenated IDs (`safe-builder`, `viral-designer`, `infra-hacker`) per `lib/types.ts:2-4` and `lib/demo-data.ts:53-65`. The `cellAttacksFor` function compares `e.actorId === from` where `from` is `"safe_builder"` (underscore) but real events have `actorId: "safe-builder"` (hyphen). The comparison never matches, so the attack matrix always renders as empty regardless of actual battle data.

4. `components/live-battle-client.tsx:126-128` — Race condition causes false `"open"` status. The `setTimeout` at line 126-128 unconditionally dispatches `{ type: "status", status: "open" }` after 100ms. If the SSE connection errors within those 100ms, `onConnectionError` (line 120-121) dispatches `{ type: "status", status: "reconnecting" }`, but the timer then fires and overwrites it with `"open"` — falsely indicating a healthy connection. The UI will show "connected" while the connection is actually broken and reconnecting.

5. `components/header-actions.tsx:30` — SSR hydration mismatch on `shareUrl`. The expression `typeof window === "undefined" ? "http://localhost:3000" : window.location.href` is evaluated during render. Since this is a `"use client"` component, it is pre-rendered on the server with `"http://localhost:3000"` and then re-rendered on the client with `window.location.href`. This causes a React hydration mismatch warning. The `shareUrl` should be computed in a `useEffect` or `useState` with a lazy initializer, not during the render pass.

6. `components/battle-setup-form.tsx:73-74` — Silent fallback to literal `"demo"` battle. When `data.battle?.id` is undefined (API response missing the expected field), the code falls back to the string `"demo"` and navigates to `/battle/demo/live` with no error surfaced. This silently masks API contract changes and could route users to the wrong battle without any indication of failure. The fallback should throw or display an error to the user.

## Summary
- Criticals: 6
