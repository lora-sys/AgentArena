# Adversarial Review — Frontend Pages (R10)

Date: 2026-07-10
Reviewer: r10-frontend-pages

## CRITICAL

1. **app/agent/[id]/passport/page.tsx:135-136** — `loadFromDemoBundle` is used as fallback on ANY error (network failure, parse failure, fetch rejection) via `catch { return loadFromDemoBundle(agentId); }` at line 135. This means production failures silently show fake demo data (the viral-designer champion) to users requesting real battle passports. A user navigating to `/agent/safe-builder/passport` during a network outage sees viral-designer's passport data. The `loadFromDemoBundle` function at line 122 also activates on `!response.ok`, covering HTTP 5xx, 404, etc.

2. **app/battle/[id]/result/page.tsx:223** — `useEffect` has dependency `[params]` where `params` is a `Promise<{ id: string }>`. Promise identity changes on every render, causing the effect (and the fetch call) to re-fire on every render. In production this will cause a feedback loop: the effect sets `setBattleId(id)`, triggers a re-render, which gives `params` a new identity, which re-fires the effect, which re-fetches, ad infinitum. This will DOS the API and freeze the browser.

3. **app/agent/[id]/passport/page.tsx:262** — Same bug: `useEffect` has dependency `[params]` (a Promise). Every render creates a new Promise object, causing the effect to re-run, re-fetch, re-set state, re-render, re-fire — infinite loop.

4. **app/agent/[id]/passport/page.tsx:1-3 + app/agent/viral-designer/passport/page.tsx:1** — Both files import `print.css` as a side-effect at module top-level. This causes `print.css` to be bundled into the CSS for the entire application (not gated by `@media print` — Next.js inlines all CSS imports). The print styles will be present globally and may cause layout shifts or style leakage on non-passport pages. The correct pattern is to use `@media print {}` blocks within `globals.css`.

5. **app/agent/viral-designer/passport/page.tsx + app/agent/[id]/passport/page.tsx** — Duplicate implementation with drift risk. The static route (`viral-designer`) and dynamic route (`[id]`) render completely different markup for the same logical page. The static page has its own `sealInitials`, `shareUrl`, and `isChampion` logic that can silently diverge from the dynamic route. The comment at line 18 says "both pages must stay in sync" — this is a fragile guarantee with no enforcement. Any fix to one page will not be applied to the other.

## Summary

- Criticals: 5