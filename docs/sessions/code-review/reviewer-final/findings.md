# Adversarial Review — Final (post skills+commands)

Date: 2026-07-10
Reviewer: reviewer-final

## CRITICAL

1. **`.claude/commands/fix-task.md:2` and `.claude/commands/pm-task.md:2` — missing `name` field in YAML frontmatter** — Every other Claude Code command and skill file in this repo declares a `name` key (see `.claude/commands/qa-task.md`, `.claude/commands/ui-task.md`, `.claude/skills/agentarena-visual-baseline/SKILL.md`). Without `name`, these commands may not register correctly with Claude Code's command/skill loader — `/pm-task` and `/fix-task` could be silently dropped from the user's invocation list. All four command files (`pm-task`, `fix-task`, `qa-task`, `ui-task`) have this same omission.

2. **`lib/sse-client.ts:74,119` — backoff never resets after a healthy reconnection** — The `backoff` variable is initialised to `initialBackoffMs` (line 74) and only ever doubled (`Math.min(backoff * 2, maxBackoffMs)` at line 119). There is no reset path. If a connection drops, reconnects after 500ms, then runs cleanly for 10 minutes before dropping again, the next reconnect will wait `maxBackoffMs` (5000ms by default) instead of the intended `initialBackoffMs`. This is the canonical SSE reconnection bug — the test suite never exercises a healthy reconnect between failures, so it slips through.

## HIGH

3. **`lib/sse-client.ts:117-118` — stacked reconnect timers on repeated `onerror`** — A single `EventSource` can fire `onerror` multiple times (the spec allows this for connection-state errors). The handler creates a new `setTimeout` on line 118 without first clearing `reconnectTimer`. If `onerror` fires twice in quick succession (before the first timer fires), two pending reconnect timers stack up. Both will fire, each creating a fresh `EventSource`; only one of them is stored in `source`, the other leaks. Fix: `if (reconnectTimer !== null) clearTimeout(reconnectTimer)` before `setTimeout`.

4. **`components/live-battle-client.tsx:166-171` — `elapsedSec` is not reset when `battleId` changes** — The `useEffect` that drives the elapsed-second timer has an empty dependency array (`[]`), so it is only set up once at mount. The SSE effect (line 104, deps `[battleId]`) does correctly reset `startedAtRef.current`, but `elapsedSec` state retains the previous battle's value until the next `setInterval` tick (up to 1 second later). The user will see the old battle's elapsed time briefly when navigating between battles in the SPA. Either add `battleId` to the deps and reset `setElapsedSec(0)`, or use a `useRef`-driven derived value instead of `useState`.

5. **`components/live-battle-client.tsx:151` — `as Parameters<typeof router.push>[0]` bypasses type checking** — The route `"/battles"` is asserted via cast rather than validated by the type system. If the real `Router.push` signature changes (Next.js has evolved this across minor versions), this site will silently compile and crash at runtime. Either use the typed `Route` import or refactor to a typed push helper.

## MEDIUM

6. **`components/live-battle-client.tsx:137` — `handleCancel` has no in-flight guard** — A user can spam-click the cancel button, queuing multiple `POST /cancel` requests. The button stays enabled until the response arrives. Add a `cancellingRef` or local `isCancelling` state to disable the button after the first click.

7. **`components/live-battle-client.test.tsx:13-30` — SWR mock ignores its second argument (the fetcher URL)** — The mock returns a hard-coded `data` object regardless of what key is passed. If the SWR fetcher is ever invoked with a different battleId path, the test still returns the same data, masking bugs. A two-line improvement would be `default: (key) => ({ data: key === "/api/battles/battle-42/status" ? {...} : undefined, ... })`.

8. **`lib/runtime/mastra.ts:170` — `this.fallback = new MockRuntime()` as a class-field initializer** — Works correctly because field initializers run after `super()` and before constructor body in JavaScript, but it is non-obvious to readers expecting all initialization inside `constructor(options)`. Refactor to `private readonly fallback: MockRuntime;` declared at line 84 + assigned in constructor for clarity.

## Summary
- Criticals: 2
- Highs: 3
- Mediums: 3
- MVP ready to ship: no — the SSE backoff-reset bug (Critical #2) will degrade UX for any user who leaves a battle tab open through a transient network hiccup; the missing `name` field on command files (Critical #1) means `/pm-task` and `/fix-task` may not be invocable, which breaks the documented PM workflow.
