---
name: agentarena-visual-baseline
description: Capture visual baselines of Agent Arena pages via agent-browser. Use for PRD §16.3 screenshot points (home, setup, live, result, replay, passport) and post-fix regression checks.
type: project-skill
---

# Agent Arena — Visual Baseline Capture

## When to use
- After every UI change (component, page layout, design tokens)
- After every fix agent completes
- Before declaring "MVP demo-ready" or "production-ready"
- When running /loop rounds for polishing

## Workflow

1. **Start dev** (if not running):
   ```bash
   pnpm dev > /tmp/dev.log 2>&1 &
   sleep 15
   curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/
   ```

2. **For each page** (per PRD §16.3):
   - `agent-browser open <url>`
   - `agent-browser set viewport 1440 900` (or 390 844 for mobile)
   - `agent-browser screenshot <path>`
   - `agent-browser close` when done

3. **Standard screenshots to capture per page**:
   - Desktop 1440x900
   - Mobile 390x844
   - (Optional) Reduced-motion variant
   - (Optional) Loading state (use `agent-browser wait --load networkidle` first)

4. **Naming convention** (per docs/test-guidelines.md §6.3):
   ```
   docs/qa/visual-baselines/{purpose}-{page}-{date}.png
   ```
   Examples:
   - `round3-live-page-20260710.png`
   - `post-fix2-home-mobile-20260710.png`

5. **Commit** the PNG (do NOT commit .env or status.md):
   ```bash
   git add docs/qa/visual-baselines/
   git -c user.email="..." -c user.name="..." commit -m "chore: round N visual baselines"
   ```

## PRD §16.3 screenshot points (the 6 must-have)
1. **Home** — `http://localhost:3000/`
2. **Battle Setup** — `http://localhost:3000/battle/new`
3. **Live** — `http://localhost:3000/battle/demo/live` (CRITICAL: shows 5-state agent cards)
4. **Result** — `http://localhost:3000/battle/demo/result` (judge scoreboard)
5. **Replay** — `http://localhost:3000/battle/demo/replay` (event timeline)
6. **Passport** — `http://localhost:3000/agent/viral-designer/passport` (gold seal + 2-col)

## Common pitfalls
- **Dev server cold compile**: first page load takes 10-30s. Use `agent-browser wait --load networkidle` or `page.goto` retry pattern.
- **System Chromium missing**: pass `PLAYWRIGHT_CHROMIUM_PATH=/usr/bin/chromium` for e2e tests.
- **Element selector missing**: add `data-testid="..."` to page components if e2e test breaks.
- **Don't commit status.md**: gitignore rule `docs/sessions/agents/*/status.md` covers it.

## Example (capture all 6 points)
```bash
agent-browser open http://localhost:3000/
agent-browser set viewport 1440 900
agent-browser screenshot docs/qa/visual-baselines/round1-home-desktop-20260710.png
agent-browser set viewport 390 844
agent-browser screenshot docs/qa/visual-baselines/round1-home-mobile-20260710.png
# repeat for each of 6 pages
```

## Evidence rules
- Every screenshot must be referenced in the commit message or status doc
- Visual regressions: pixel diff with previous baseline (human review)
- New baseline needed when: new page, major layout change, design token change
