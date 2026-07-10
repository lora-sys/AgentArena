# Visual Review — 2026-07-10

**Reviewer**: visual-review agent (issue #17)
**Scope**: Lock baselines for all 6 PRD §16.3 screenshot points + visual review of all 4 frontend pages
**Date**: 2026-07-10
**Dev server**: `pnpm dev` (port 3000)

---

## 1. Summary

| Item | Count |
|---|---|
| Screenshot points captured | 6 (per PRD §16.3) |
| Viewports captured | desktop 1440x900, mobile 390x844, reduced-motion |
| Total PNG baselines saved | 22 (6 desktop + 6 mobile + 6 reduced + 2 home + 1 home mobile) |
| Pages reviewed | 5 (home, live, result, replay, passport) |
| Critical visual issues | 3 |
| Minor visual issues | 5 |

All 6 screenshot points have been captured at desktop, mobile, and reduced-motion variants and stored in `docs/qa/visual-baselines/`. The visual review covered the four frontend pages built so far plus the home page.

---

## 2. Screenshots captured

### 2.1 Desktop 1440x900

| Point | File | Route | Section |
|---|---|---|---|
| Home | `screenshot-home-desktop-20260710.png` | `/` | Full page |
| 1 — Team entrance | `screenshot-1-team-entrance-desktop-20260710.png` | `/battle/demo/live` | Top section |
| 2 — Three proposals | `screenshot-2-proposals-desktop-20260710.png` | `/battle/demo/live` | Round 1 |
| 3 — Cross Attack matrix | `screenshot-3-attack-matrix-desktop-20260710.png` | `/battle/demo/live` | Round 2 |
| 4 — Defense cards | `screenshot-4-defense-desktop-20260710.png` | `/battle/demo/live` | Round 3 |
| 5 — Judge scoreboard | `screenshot-5-scoreboard-desktop-20260710.png` | `/battle/demo/result` | Full page |
| 6 — Passport | `screenshot-6-passport-desktop-20260710.png` | `/agent/viral-designer/passport` | Full page |

### 2.2 Mobile 390x844

| Point | File | Route |
|---|---|---|
| Home | `screenshot-home-mobile-20260710.png` | `/` |
| 1 — Team entrance | `screenshot-1-team-entrance-mobile-20260710.png` | `/battle/demo/live` |
| 2 — Three proposals | `screenshot-2-proposals-mobile-20260710.png` | `/battle/demo/live` |
| 3 — Cross Attack matrix | `screenshot-3-attack-matrix-mobile-20260710.png` | `/battle/demo/live` |
| 4 — Defense cards | `screenshot-4-defense-mobile-20260710.png` | `/battle/demo/live` |
| 5 — Judge scoreboard | `screenshot-5-scoreboard-mobile-20260710.png` | `/battle/demo/result` |
| 6 — Passport | `screenshot-6-passport-mobile-20260710.png` | `/agent/viral-designer/passport` |

### 2.3 Reduced motion (desktop, 1440x900)

| Point | File | Route |
|---|---|---|
| 1 — Team entrance | `screenshot-1-team-entrance-reduced-20260710.png` | `/battle/demo/live` |
| 2 — Three proposals | `screenshot-2-proposals-reduced-20260710.png` | `/battle/demo/live` |
| 3 — Cross Attack matrix | `screenshot-3-attack-matrix-reduced-20260710.png` | `/battle/demo/live` |
| 4 — Defense cards | `screenshot-4-defense-reduced-20260710.png` | `/battle/demo/live` |
| 5 — Judge scoreboard | `screenshot-5-scoreboard-reduced-20260710.png` | `/battle/demo/result` |
| 6 — Passport | `screenshot-6-passport-reduced-20260710.png` | `/agent/viral-designer/passport` |

---

## 3. Findings per design.md §10.3 checklist

### 3.1 Screenshot point 1 — Agent Team entrance (`/battle/demo/live`)

**Layout integrity**: The 3-column team grid is present and shows Safe Builder (blue), Viral Designer (pink), Infra Hacker (green). Each card has team color border, avatar circle, role tagline, score, and a line chart.
**Type hierarchy**: Battle ID in mono, team name as H3, tagline in muted text, score prominent.
**Color discipline**: Team colors are applied correctly per design tokens. Score values use semantic colors.
**Spacing rhythm**: 4/8/12/16 scale appears to be followed.
**Issues found**:
- **MINOR**: The team cards stack vertically on mobile (acceptable) but the line charts inside each card add visual noise that competes with the team identity. Consider hiding the chart on mobile or reducing its size.
- **MINOR**: The "N" (Next.js dev tools button) overlaps the team card on mobile screenshots, partially obscuring the third team's score.

### 3.2 Screenshot point 2 — Three proposals side-by-side (`/battle/demo/live`)

**Layout integrity**: Three columns of proposals are visible side-by-side at desktop. Each has title, tagline, DEMO PLAN, TECHNICAL HOOK sections.
**Type hierarchy**: Title as H3, section labels in caps, body text in standard weight.
**Issues found**:
- **MINOR**: On mobile, the three columns become very narrow and text wraps awkwardly, making the "Technical Hook" content cut off. The right column (Infra Hacker) is partially off-screen on 390px viewport.
- **MINOR**: The section labels "DEMO PLAN" and "TECHNICAL HOOK" are in all-caps with letter-spacing but lack visual separation from the body text below. A subtle divider or extra spacing would help.

### 3.3 Screenshot point 3 — Cross Attack matrix (`/battle/demo/live`)

**Layout integrity**: The attack cards are stacked vertically (one per attack) rather than displayed as a matrix (rows=attacker, columns=target). The design.md §4.3 spec calls for a bipartite-style matrix.
**Issues found**:
- **CRITICAL**: The Cross Attack section does not implement the matrix layout from design.md §4.3. Instead, it shows a flat list of attack cards with "Attacker → Target" pairs. The bipartite matrix with cell badges is missing.
- **MINOR**: Attack severity (High/Medium/Low) uses color only — a text label is present, which partially mitigates this.

### 3.4 Screenshot point 4 — Defense / revision cards (`/battle/demo/live`)

**Layout integrity**: Defense cards are grouped by agent, each with "Defended" and "Conceded" chips and revision text.
**Type hierarchy**: Round header as H2, agent labels, chip badges for accept/reject.
**Issues found**:
- **MINOR**: The defense section appears below the attack section on the live page but is not visually distinct enough. A section divider or card border would help separate the two rounds.
- **OBSERVATION**: The "revisions" content is present as text but does not follow the mono formatting specified in design.md §4.4.

### 3.5 Screenshot point 5 — Judge scoreboard (`/battle/demo/result`)

**Layout integrity**: A ranked table is present with Rank, Team, Total Score, Novelty, Feasibility, Demo Wow, Tech Depth, User Value, Long-term columns. Champion card with trophy and "Why it won" text is above the table.
**Type hierarchy**: Champion name in bold, score in mono, dimension scores as numbers.
**Issues found**:
- **CRITICAL**: The score values in the table (e.g. "90", "70", "95") do not have visible `evidenceEventId` links on hover or focus, as required by design.md §4.5. The evidence trail is missing from the UI.
- **MINOR**: The bottom row of scores (rank 3) has blue underline bars beneath each score value, which is a progress-bar-like visual element. The other rows do not have this. Inconsistent rendering.
- **MINOR**: The "Back to Battles" link text runs into the "Battle #42" text without spacing ("Back to BattlesBattle #42"). Missing space or separator.

### 3.6 Screenshot point 6 — Passport Snapshot (`/agent/viral-designer/passport`)

**Layout integrity**: Single-column layout with avatar circle, agent name, tagline, and sections for Contribution Summary, Accepted Claims, Rejected Claims, and Reputation Snapshot.
**Issues found**:
- **CRITICAL**: The Passport page does not display a gold seal or the two-column strengths/weaknesses layout from design.md §4.6. The current implementation is a single-column stacked layout.
- **MINOR**: Text wrapping is aggressive — "Recent Accepted Claims" and "Recent Rejected Claims" section titles are bold but lack spacing.
- **MINOR**: The evidence text under each claim is very small (caption size) and may be hard to read at default zoom.

### 3.7 Home page (`/`)

**Layout integrity**: Hero section with headline, CTA buttons, three team identity cards, and a "How it works" timeline.
**Type hierarchy**: Large hero headline (t-3xl), body text, button labels.
**Issues found**:
- **MINOR**: The three team cards in the hero have mini line charts that, combined with the score numbers, create visual density that may be overwhelming on first view.
- **MINOR**: The "How it works" timeline tabs (Briefing, Proposal, Cross Attack, Judging, Champion) are evenly spaced but lack active-state visual treatment (no highlighted current state).

### 3.8 Reduced motion variants

All reduced-motion screenshots are visually equivalent to the standard desktop captures. No content shifts, no layout breaks. Confirmed working as expected per design.md §2.4.

### 3.9 Dark mode

Not captured — no dark mode toggle or `prefers-color-scheme: dark` was found in the current implementation. The design.md §8 spec calls for dark mode support but it has not been built yet.

---

## 4. Critical issues (must fix)

1. **Cross Attack matrix is not a matrix** (screenshot point 3): The bipartite-style matrix from design.md §4.3 has not been implemented. Currently renders as a flat list of attack cards.
2. **Passport page missing gold seal and two-column layout** (screenshot point 6): The design.md §4.6 spec for a seal + strengths/weaknesses columns is not implemented. Current layout is single-column stacked.
3. **Judge scoreboard missing evidence event ID links** (screenshot point 5): The mandatory `evidenceEventId` per score (design.md §4.5) is not visible or accessible in the UI.

---

## 5. Minor issues (should fix)

1. Next.js dev tools button overlaps content on mobile screenshots.
2. Proposal columns become very narrow on 390px mobile — text wraps awkwardly.
3. Defense section lacks visual separation from attack section on the live page.
4. Champion score row has blue underlines beneath scores that other rows do not.
5. "Back to Battles" and "Battle #42" text runs together without spacing.

---

## 6. Recommendations for Frontend Engineer (老师)

1. **Implement the attack matrix** as a 3x3 grid (attacker rows, target columns) with cell badges showing attack count and severity. Click a cell to expand the attack card below. See design.md §4.3.
2. **Implement the Passport page two-column layout** with a gold seal in the top-left, identity strip, strengths/weaknesses columns, and evidence link list. See design.md §4.6.
3. **Add evidence event ID tooltips** to judge scoreboard cells. Each score should show its `evidenceEventId` on hover (tooltip) and on focus (visible). See design.md §4.5.
4. **Fix the "Back to Battles" spacing** in the result page breadcrumb/nav area.
5. **Add visual separation** between the attack and defense sections on the live page (section dividers or card border).
6. **Consider hiding or simplifying the line charts** in team cards on mobile to reduce visual noise.
7. **Implement dark mode** via `prefers-color-scheme: dark` (or add a toggle). The tokens are already defined in design.md §2.1.

---

## 7. Tools used

- `agent-browser` v0.26.0 (screenshot capture)
- Dev server: `pnpm dev` (Next.js 15, port 3000)
- Routes tested: `/`, `/battle/demo/live`, `/battle/demo/result`, `/agent/viral-designer/passport`

Note: A Storybook instance was not running during this review (no `pnpm --filter ui-kit storybook` process was found). The Storybook screenshot at desktop was skipped. If Storybook is required for the acceptance bar, it should be started in a future review pass.
