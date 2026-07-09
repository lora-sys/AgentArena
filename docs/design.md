# design.md — Agent Arena Visual Language

> Visual direction: **B — Linear × 体育数据可视化**. Inter Display + Inter Variable + Geist Mono. Evidence-first. Sports-broadcaster pacing. Light default + dark variant.
>
> Owner: UI/UX Designer. Consumed by Frontend Engineer (老师) and QA Engineer.
>
> Read `CLAUDE.md` first for workspace + invariants, then `agents.md` for handoff protocol.

---

## 1. Design principles (tied to PRD product principles)

| ID | Principle | Visual consequence |
|---|---|---|
| D1 | Evidence over claims | Every screen shows event-id links, never bare numbers |
| D2 | Battle as protocol | Round state always visible (timeline rail), not implied |
| D3 | Replay as proof | Scoreboard always cites its `evidenceEventId` |
| D4 | Passport as memory | Passport card survives across pages; identity glyph constant |
| D5 | Engine over prompts | UI never invents state — only reflects engine events |
| D6 | Arena, not theater | Real data density. No animated mascots. No emoji. No confetti. |
| D7 | Pitchable screenshots | Every screen passes the "1-second skim" test for a non-technical reviewer |

---

## 2. Tokens

All tokens live in `packages/ui-kit/src/tokens.css` (CSS variables) and mirrored in `docs/design/tokens.json` (machine-readable for QA baselines).

### 2.1 Color — semantic + team

```css
:root {
  /* surface */
  --bg:          #FAFAF9;
  --bg-elev:     #FFFFFF;
  --bg-sunken:   #F4F4F2;
  --fg:          #0A0A0A;
  --fg-muted:    #6B6B6B;
  --fg-subtle:   #A3A3A3;

  /* line */
  --border:        #E7E5E4;
  --border-strong: #D6D3D1;
  --ring:          #0A0A0A;        /* focus */

  /* team identity */
  --team-safe:   #2563EB;   /* Safe Builder */
  --team-viral:  #EC4899;   /* Viral Designer */
  --team-infra:  #059669;   /* Infra Hacker */
  --champion:    #D4AF37;   /* gold seal */

  /* severity */
  --sev-low:     #94A3B8;
  --sev-med:     #F59E0B;
  --sev-high:    #DC2626;
  --sev-fatal:   #7C2D12;

  /* status */
  --status-ok:        #059669;
  --status-warn:      #F59E0B;
  --status-err:       #DC2626;
  --status-info:      #2563EB;

  /* alpha overlays (used for chips, focus halos) */
  --team-safe-08:  rgba(37, 99, 235, 0.08);
  --team-viral-08: rgba(236, 72, 153, 0.08);
  --team-infra-08: rgba(5, 150, 105, 0.08);
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg:        #0A0A0A;
    --bg-elev:   #171717;
    --bg-sunken: #050505;
    --fg:        #FAFAF9;
    --fg-muted:  #A3A3A3;
    --fg-subtle: #525252;

    --border:        #262626;
    --border-strong: #404040;
    --ring:          #FAFAF9;

    --team-safe-08:  rgba(37, 99, 235, 0.18);
    --team-viral-08: rgba(236, 72, 153, 0.18);
    --team-infra-08: rgba(5, 150, 105, 0.18);
  }
}
```

**Rules**:
- Never reach for raw hex in components. Always `var(--team-safe)`.
- Team color is allowed only on: TeamCard avatar, ScoreCell accent, EventLedger actor tag. Never on plain text in body copy.
- Champion gold is reserved for: passport seal, "winner" pill, exported report cover. Never on buttons.

### 2.2 Typography

```css
:root {
  --font-display: 'Inter Display', 'Inter', -apple-system, sans-serif;
  --font-body:    'Inter Variable', 'Inter', -apple-system, sans-serif;
  --font-mono:    'Geist Mono', 'JetBrains Mono', ui-monospace, monospace;

  /* scale (rem on 16px base) */
  --t-xs:    0.75rem;   /* 12 — caption, label */
  --t-sm:    0.875rem;  /* 14 — secondary */
  --t-base:  1rem;      /* 16 — body */
  --t-md:    1.125rem;  /* 18 — emphasis body */
  --t-lg:    1.375rem;  /* 22 — card title */
  --t-xl:    1.75rem;   /* 28 — section header */
  --t-2xl:   2.25rem;   /* 36 — page header */
  --t-3xl:   3rem;      /* 48 — hero (Home only) */

  /* weight */
  --w-regular: 400;
  --w-medium:  500;
  --w-bold:    700;
}
```

**Pairing rules**:
- Display only for page H1 + Result page winner name. Never body.
- Mono for: battle IDs, event IDs, timestamps, scores, token counts. Always `tabular-nums`.
- Body text never below 14px.

### 2.3 Space, radius, shadow

```css
:root {
  --s-1: 0.25rem;   /*  4 */
  --s-2: 0.5rem;    /*  8 */
  --s-3: 0.75rem;   /* 12 */
  --s-4: 1rem;      /* 16 */
  --s-6: 1.5rem;    /* 24 */
  --s-8: 2rem;      /* 32 */
  --s-12: 3rem;     /* 48 */
  --s-16: 4rem;     /* 64 */
  --s-24: 6rem;     /* 96 */

  --r-sm: 4px;
  --r-md: 8px;
  --r-lg: 12px;
  --r-xl: 20px;
  --r-full: 9999px;

  --shadow-1: 0 1px 2px rgba(0,0,0,0.04), 0 1px 1px rgba(0,0,0,0.02);
  --shadow-2: 0 4px 8px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04);
  --shadow-3: 0 12px 24px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04);
}
```

### 2.4 Motion

```css
:root {
  --dur-fast:   120ms;   /* hover, focus ring */
  --dur-base:   200ms;   /* state change */
  --dur-slow:   320ms;   /* round transition */
  --dur-stage:  480ms;   /* entrance */

  --ease-out:   cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in:    cubic-bezier(0.4, 0, 1, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  --stagger-1:  60ms;
  --stagger-2:  120ms;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --dur-fast: 0ms;
    --dur-base: 0ms;
    --dur-slow: 0ms;
    --dur-stage: 0ms;
    --stagger-1: 0ms;
    --stagger-2: 0ms;
  }
}
```

---

## 3. Component library (`packages/ui-kit`)

Every component ships: TypeScript API, Storybook story with all states, a11y story (keyboard + screen reader), reduced-motion story.

| Component | Purpose | Key props | States |
|---|---|---|---|
| `Button` | Primary action | `variant: primary/secondary/ghost/danger`, `size: sm/md/lg` | default, hover, focus-visible, active, disabled, loading |
| `IconButton` | Compact action | `aria-label` required | default, hover, focus-visible, disabled |
| `Card` | Surface container | `elevation: 0/1/2/3`, `padding` | default, interactive, selected |
| `Badge` | Small label | `tone: neutral/team-safe/team-viral/team-infra/champion/sev-*` | default |
| `StatPill` | Numeric stat | `label`, `value`, `delta?` | default, positive, negative |
| `SeverityTag` | Attack severity | `severity: low/med/high/fatal` | default, hover (shows evidence id) |
| `TeamCard` | Contestant identity | `team: safe/viral/infra`, `score`, `version` | loading, ready, winner, loser |
| `ScoreCell` | One rubric dimension | `dim`, `value`, `judgeId` | default, hover (shows judge + evidence) |
| `AttackCard` | One attack | `attacker`, `target`, `severity`, `claim`, `evidence`, `suggestedFix` | default, hovered (target glows) |
| `DefenseCard` | One defense | `agentId`, `accepted[]`, `rejected[]`, `revisions[]`, `remainingRisks[]` | default, expanded |
| `EventLedger` | Live event stream | `events[]`, `virtualize` | streaming, paused, scrolled |
| `TimelineRail` | Round progress | `rounds[]`, `current` | default, animated |
| `PassportSeal` | Winner identity | `agentId`, `result`, `totalScore` | default |
| `EmptyState` | No data | `title`, `hint`, `cta?` | default |
| `ErrorBoundary` | Catastrophic fail | `error`, `reset` | default, retrying |

### 3.1 Storybook stories (per component)

```
packages/ui-kit/src/<Component>/<Component>.stories.tsx
├── Default
├── AllStates          # one canvas, every state side by side
├── Keyboard           # focus order annotation
├── ScreenReader       # transcript of VO reading the component
└── ReducedMotion      # still frame + reduced-motion screenshot
```

### 3.2 ui-kit boundaries (from CLAUDE.md §4)

- **No domain knowledge**: ui-kit does not import `packages/schemas`. Components are typed against primitives (`string`, `number`, `'low'|'med'|'high'|'fatal'`).
- **Composition over configuration**: prefer `Card` + `StatPill` + `SeverityTag` over a bespoke `ProposalCard` inside ui-kit. Domain composition lives in `apps/web/components/`.

---

## 4. Six screenshot points (PRD §16.3)

Each must have a frame in `docs/learnings/visual/` named `screenshot-N-<page>-<date>.png`.

### 4.1 #1 Agent Team entrance
- **Where**: `/battle/[id]/live` top strip
- **Layout**: 3-column grid, equal weight, monospace battle_id above
- **Copy**: Agent name + role tagline (8 words max) + `version: v1` in mono
- **Motion**: stagger 60ms fade-up; team color border animates in from 0 → 2px on settle
- **Data binding**: each card is `TeamCard` driven by `BattleParticipant`

```
+------------------------------------------------------------+
|  battle_8f2a · LIVE                                        |
+------------------------------------------------------------+
|  ┌──────────┐  ┌──────────┐  ┌──────────┐                 |
|  │ Safe     │  │ Viral    │  │ Infra    │                 |
|  │ Builder  │  │ Designer │  │ Hacker   │                 |
|  │ v1       │  │ v1       │  │ v1       │                 |
|  │ 蓝 /     │  │ 粉 /     │  │ 绿 /     │                 |
|  │ 收敛 MVP │  │ 强叙事   │  │ 协议化   │                 |
|  └──────────┘  └──────────┘  └──────────┘                 |
+------------------------------------------------------------+
```

### 4.2 #2 Three proposals side-by-side
- **Where**: `/battle/[id]/live` after `proposal_created` events
- **Layout**: 3 columns, 4 sections per column (title / oneLiner / proposedDirection / 48h plan)
- **Motion**: when first proposal lands, others stagger in 120ms each
- **Data binding**: each column is a `ProposalCard` (composed from `Card` + `Heading` + `Body` + `MonoList`)

### 4.3 #3 Cross Attack matrix
- **Where**: `/battle/[id]/live` during attack round
- **Layout**: bipartite-style matrix. Rows = attacker. Columns = target. Cells = attack count badge.
- **Card expansion**: clicking a cell opens that single `AttackCard` below
- **Motion**: attacks land with a 200ms slide-in; target column border pulses team color on impact
- **Accessibility**: each cell is a focusable button with `aria-label="3 attacks from Safe Builder to Viral Designer"`

### 4.4 #4 Defense / revision cards
- **Where**: `/battle/[id]/live` during defense round
- **Layout**: vertical stack grouped by agent, each with `accepted` / `rejected` chips + `revisions` mono list
- **Copy rule**: defense revisions must be traceable to a specific attack id, never freeform
- **Motion**: revision lines type in at 20ms/char (mono) to telegraph evidence provenance

### 4.5 #5 Judge scoreboard
- **Where**: `/battle/[id]/result`
- **Layout**: ranked list (1st / 2nd / 3rd), each row = team + dimension bars + total + winner/loser reasons
- **Mandatory**: every score shows `evidenceEventId` in mono on hover (tooltip + visible on focus)
- **Motion**: when results arrive, bars animate from 0 → value over 480ms with `--ease-out`
- **Reversed-a11y pattern**: don't rely on color alone — use position (1st/2nd/3rd) and trophy iconography

### 4.6 #6 Passport Snapshot
- **Where**: `/agent/[id]/passport`
- **Layout**: seal (top-left, gold), identity strip, two-column (strengths / weaknesses), evidence link list, replay link
- **Invariant**: weaknesses column NEVER empty. If judge scored all-wins, show "low-severity weaknesses detected" per PRD §12.3.
- **Print**: page must print cleanly (PRD export use case) — `@media print` styles in `apps/web/app/print.css`

---

## 5. Page wireframes

For each page: above-the-fold layout, key interactive zones, what loads from where.

### 5.1 `/` Home

```
+------------------------------------------------------------+
|  ⚔ Agent Arena                              docs · github |
+------------------------------------------------------------+
|                                                            |
|   Every agent claims to be powerful.                       |
|   Agent Arena makes them prove it.                         |
|                                                            |
|   [ Start a battle ]   [ See example ]                     |
|                                                            |
+------------------------------------------------------------+
|   How it works                                             |
|   ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐                       |
|   │  1  │  │  2  │  │  3  │  │  4  │                       |
|   │Trial│  │Battle│ │Replay│ │Pass- │                      |
|   │setup│  │ runs │ │shows │ │port  │                      |
|   └─────┘  └─────┘  └─────┘  └─────┘                       |
+------------------------------------------------------------+
|   Built-in teams                                           |
|   Safe Builder · Viral Designer · Infra Hacker             |
+------------------------------------------------------------+
```

Hero is the only place `t-3xl` lives. CTA is the only `--shadow-3` button on this page.

### 5.2 `/battle/new` Trial setup

```
+------------------------------------------------------------+
|  ← Back            New Battle                              |
+------------------------------------------------------------+
|  Idea                                                      |
|  ┌────────────────────────────────────────────────────┐    |
|  │  e.g. "An AI app that turns voice notes into       │    |
|  │  structured PRD drafts"                            │    |
|  └────────────────────────────────────────────────────┘    |
|                                                            |
|  Mode        ◉ Quick Battle (60–90s)                       |
|              ○ Full Battle (2–5 min)                       |
|                                                            |
|  Time budget  [ 240s default ]                             |
|                                                            |
|  [ Start battle → ]                                        |
+------------------------------------------------------------+
```

Form is a 4-field RHF + Zod resolver. Errors inline below field, never alert.

### 5.3 `/battle/[id]/live`

```
+------------------------------------------------------------+
|  battle_8f2a · LIVE                ⏱ 1:42  tokens 12.4k    |
|  ●  ●  ●  ◉  ○  ○  ○    briefing  propose  attack  ...     |
+------------------------------------------------------------+
|   [screenshot point #1 — Team entrance strip]              |
|                                                            |
|   [screenshot point #2 — 3 proposals]   or                 |
|   [screenshot point #3 — Attack matrix] or                 |
|   [screenshot point #4 — Defense cards]                    |
|                                                            |
|   [EventLedger — virtualized stream]                       |
+------------------------------------------------------------+
```

SSE only. Page is server-rendered for first paint with empty state, then hydrated and event stream attaches. Loading state per round uses EventLedger header `streaming`, never a spinner over the whole page.

### 5.4 `/battle/[id]/result`

```
+------------------------------------------------------------+
|  battle_8f2a · COMPLETED                  ⏱ 3:42          |
+------------------------------------------------------------+
|                                                            |
|   ★  Champion: Viral Designer                              |
|      "Fastest demo path, strongest pitch"                  |
|                                                            |
|   [Judge scoreboard — ranked list]                         |
|                                                            |
|   [Artifacts — 7 markdown files, download all]             |
|                                                            |
|   [View replay →]   [View passport →]   [Export .md]       |
+------------------------------------------------------------+
```

### 5.5 `/battle/[id]/replay`

Vertical timeline. Each event is a row. Click → drawer with full payload + judge reasoning + linked event ids. No auto-play; user controls pace.

### 5.6 `/agent/[id]/passport`

```
+------------------------------------------------------------+
|   [seal]  Viral Designer · v1                              |
|           Result: WINNER · battle_8f2a · 8.1/10            |
+------------------------------------------------------------+
|   Strengths                  │ Weaknesses                  |
|   ─────────────────────────  │ ─────────────────────────   |
|   · Strong demo path         │ · Risk control light        |
|   · Clear pitch              │ · Demo depends on animation |
|                                                            |
|   Evidence                                                |
|   ev_8f2a_0042  proposal_created                           |
|   ev_8f2a_0073  attack_accepted                            |
|                                                            |
|   [View replay →]   [Print]   [Share link]                 |
+------------------------------------------------------------+
```

### 5.7 `/examples/[id]`

Pre-baked. Identical UI to `/battle/[id]/result`, plus a banner at top: "Example battle · pre-recorded · won't change". Loads from `examples/fixtures/` directly (no DB).

---

## 6. Motion spec

| Trigger | Animation | Duration | Easing |
|---|---|---|---|
| Hover on Button/Card | background lighten + 1px lift | `--dur-fast` | `--ease-out` |
| Focus ring | 2px outline + 2px offset | `--dur-fast` | `--ease-out` |
| Team card entrance | opacity 0→1, translateY 8→0 | `--dur-stage` | `--ease-out`, stagger 60ms |
| Round transition | out: opacity 1→0, 200ms / in: opacity 0→1 + translateY 8→0, 320ms | combined 520ms | `--ease-out` |
| Score bar fill | width 0→value | `--dur-stage` | `--ease-out` |
| New SSE event | row highlight pulse (team color, 8% alpha, fade 800ms) | 800ms | linear |
| Attack impact | target column border pulse team color, 200ms | 200ms | `--ease-spring` |

**Reduced motion**: all transforms become opacity-only. All durations → 0. (Token override in §2.4.)

**Don't**:
- Bouncing loaders
- Parallax on scroll
- Auto-playing carousels
- Lottie animations
- Emoji reactions
- Confetti

---

## 7. Accessibility

| Item | Rule |
|---|---|
| Contrast (text on bg) | ≥4.5:1 for body, ≥3:1 for large text + UI components |
| Contrast (non-text) | ≥3:1 for borders, focus rings, icons |
| Focus order | DOM order matches visual order. No `tabindex > 0` ever. |
| Focus visible | 2px `--ring` + 2px offset, on EVERY interactive element |
| Keyboard | All actions reachable without mouse. `Enter`/`Space` on buttons. `Esc` closes modals. |
| Screen reader | Every icon button has `aria-label`. Every severity has `aria-describedby` pointing to claim text. |
| Motion | `prefers-reduced-motion` honored globally |
| Color independence | Severity uses icon + label, not color alone. Team uses position, not color alone. |
| Lang | `<html lang="en">` on all pages |
| Zoom | Layout works at 200% zoom without horizontal scroll |
| Print | Passport page prints to one A4 with all evidence links as URLs |

---

## 8. Dark mode

Default to user preference via `prefers-color-scheme`. Manual toggle deferred to P1.

Token override set in §2.1. All other tokens (type, space, radius, shadow, motion) are mode-agnostic — only their absolute values change via the same custom-property mechanism.

Shadow in dark mode: increase blur, reduce alpha to compensate for darker base.

---

## 9. Don't-do list (anti-patterns)

Anything matching these gets rejected in review:

- Purple-on-white default palette
- Gradient text
- Drop shadows on text
- Emoji as UI iconography (decorative only, never status)
- Auto-playing anything on page load
- Placeholder text used as label
- `<div onClick>` instead of `<button>`
- Color as the sole indicator (severity, status, team)
- Tailwind arbitrary values for things that should be tokens (`bg-[#FAFAF9]` instead of `bg-bg`)
- Custom font stacks when a token already exists
- Inline `style={{...}}` for token values
- Animation on `prefers-reduced-motion: no-preference` that wasn't reduced-motion-tested

---

## 10. Visual review process

All visual work must be reviewed via `agent-browser`. Raw Playwright is for E2E automation only — visual review is a separate, deliberate step.

### 10.1 When to capture

| Moment | Command | Storage |
|---|---|---|
| Storybook story added | `agent-browser screenshot http://localhost:6006/?path=/story/<comp> docs/learnings/visual/ui-<comp>-<date>.png` | `docs/learnings/visual/` |
| Page ships in PR | `agent-browser screenshot http://localhost:3000<path> --viewport 1440x900 docs/learnings/visual/web-<page>-desktop-<date>.png` | same |
| Same page, mobile | same command with `--viewport 390x844` and suffix `-mobile` | same |
| Reduced motion check | `agent-browser screenshot <url> --reduced-motion docs/learnings/visual/<page>-reduced-<date>.png` | same |
| Dark mode | `agent-browser screenshot <url> --color-scheme dark` | same |

### 10.2 Naming convention

`<source>-<page-or-component>-<viewport|variant>-<YYYYMMDD>.png`

Examples:
- `ui-button-focus-20260709.png`
- `web-live-desktop-20260709.png`
- `web-live-mobile-20260709.png`
- `web-result-dark-20260709.png`

### 10.3 Review checklist (manual)

For each new screenshot, the UI designer (or reviewer) checks:

1. **Layout integrity** — no overflow, no orphaned elements at any breakpoint
2. **Type hierarchy** — clear H1 → H2 → body rhythm; no font-size collisions
3. **Color discipline** — every color is from a token, no raw hex
4. **Spacing rhythm** — uses 4/8/12/16 scale, no 7px or 13px
5. **Focus visible** — tab through interactive elements, ring present
6. **Reduced motion** — captured frame is meaningful, not blank
7. **Dark mode** — no hardcoded white backgrounds leaking through
8. **Six screenshot points** — for new pages that map to PRD §16.3, the matching shot is captured

### 10.4 PR evidence block (UI changes)

```markdown
## Visual evidence
- [ ] Storybook story added/updated
- [ ] agent-browser screenshots in docs/learnings/visual/
  - desktop @ 1440x900
  - mobile @ 390x844
  - reduced-motion variant
  - dark mode (if applicable)
- [ ] No "don't-do" rule violated (see §9)
- [ ] Six screenshot points covered if page maps to PRD §16.3
```

---

## 11. Handoff contract (UI/UX → Frontend)

Frontend consumes:

| Artifact | Path | Update trigger |
|---|---|---|
| Tokens CSS | `packages/ui-kit/src/tokens.css` | Token change PR by UI designer |
| Tokens JSON | `docs/design/tokens.json` | Same PR, mirrored |
| Components | `packages/ui-kit/src/<Comp>/` | New component or breaking API change |
| Storybook | `pnpm --filter ui-kit storybook` runs at :6006 | Always live |
| Wireframes | This file, §5 | Major IA change |
| Visual baselines | `docs/qa/visual-baselines/` (handed to QA at Sprint 1) | New screenshot point captured |

Frontend never edits `packages/ui-kit`. If a needed primitive is missing, file a ticket for UI designer; do not fork it inline.

---

## 12. Versioning

- `tokens.json` carries `version`. Bumping major = UI designer + Frontend sync meeting.
- Component API changes go through ADR in `docs/adr/NNNN-ui-<component>.md`.
- Storybook is the living contract; treat the docs site as source of truth over README.