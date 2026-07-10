# Adversarial Review — Design System + Tokens

Date: 2026-07-10
Reviewer: reviewer-6-design-system

## CRITICAL

1. **components/ui-kit/button.tsx:21,36** — Raw hex `"#FFFFFF"` used for `color` in both `primary` and `danger` variant styles. These should reference `var(--bg-elev)` (which resolves to `#FFFFFF` in light mode but adapts to dark mode). White text on a colored background in dark mode will be fine, but the literal hex violates the token system. No token like `--white` or `--bg-on-color` exists in the palette, but `var(--bg-elev)` would be more theme-aware.

2. **app/globals.css:380** — Raw hex `#704cff` used in `linear-gradient(135deg, #704cff, var(--blue))` for `.battle-rail li.active .rail-node`. This is a hardcoded color outside the token system. The `--team-viral` token (`#EC4899`) is already defined but a different purple (`#704cff`) is used here. This raw hex appears in multiple gradients (lines 380, 418, 462, 647, 944) creating token drift.

3. **components/battle-replay-client.tsx:28-29** — Champion gold (`var(--champion)`) used for `score_created` and `champion_selected` event timeline markers. Per PRD §2.1, champion gold is reserved for "seal / winner pill / exported report" — the score timeline marker is a general event indicator, not a winner UI element. This dilutes the semantic meaning of the champion color.

## HIGH

1. **components/ui-kit/badge.tsx:24-28** — Raw hex values used in `rgba()` expressions for background tints: `rgba(212, 175, 55, 0.12)`, `rgba(148, 163, 184, 0.12)`, `rgba(245, 158, 11, 0.12)`, `rgba(220, 38, 38, 0.12)`, `rgba(124, 45, 18, 0.12)`. The globals.css defines `--team-safe-08`, `--team-viral-08`, `--team-infra-08` as alpha overlays, but no equivalent `--champion-08`, `--sev-low-08`, `--sev-med-08`, `--sev-high-08`, or `--sev-fatal-08` tokens exist. This means the badge tones for champion/severity duplicate raw hex literals instead of using tokens.

2. **components/ui-kit/severity-tag.tsx:12-15** — Same issue: raw hex in `rgba()` for all severity backgrounds. No `--sev-*-08` tokens exist in the palette. Severity is a documented token category (PRD §2.1) but its alpha overlays are inline literals.

3. **app/globals.css:1110-1116** — Champion gold raw hex `rgba(212, 175, 55, 0.1)` and `rgba(212, 175, 55, 0.12)` used for `.path-pill.passport-version` and `.status-pill.champion` backgrounds. These should use a token (e.g., `--champion-08`) that does not yet exist in the palette.

4. **components/header-actions.tsx:214,223** — Inputs use `outline-none` without a focus-visible replacement. Keyboard users will lose all visual focus indication. The form inputs say `focus:border-team-safe` but `outline-none` removes the browser default focus ring, leaving only a border color change (which may be insufficient for WCAG 2.1 SC 2.4.7).

5. **components/ui-kit/card.tsx:38-48** — `transition` property uses `var(--dur-fast)` but there is no reduced-motion override in this component. When `prefers-reduced-motion: reduce` is active, `--dur-fast` resolves to `0ms` via globals.css, so this technically works — however, the `transform` in the transition could still cause layout shifts that are not purely motion. Additionally, `Card` when `interactive` renders as a `<button>` but has no `outline` or `focus-visible` ring style, meaning interactive cards have no keyboard focus indication.

6. **components/ui-kit/button.tsx:66** — Loading spinner uses `animation: "spin 0.6s linear infinite"`. This animation is NOT governed by `var(--dur-fast)` or any design token. Under `prefers-reduced-motion: reduce`, the global `--dur-fast` becomes `0ms` but this animation has a hardcoded duration of `600ms` and is not stopped. Users with reduced-motion preference will still see a spinning spinner.

7. **components/battle-replay-client.tsx:149,151,162** — Inline styles for virtualized list positioning (`height`, `position: absolute`, `top`, `left`, `right`). These should be token-based or CSS custom properties, not raw values. While these are dynamic calculations (not colors), the use of inline `style` bypasses the design token system.

8. **app/globals.css (dark mode block, lines 98-115)** — Missing dark mode overrides for several tokens: `--team-safe`, `--team-viral`, `--team-infra`, `--champion`, `--sev-low`, `--sev-med`, `--sev-high`, `--sev-fatal`, `--status-ok`, `--status-warn`, `--status-err`, `--status-info`. These team and severity colors do not change in dark mode. While many work adequately in both modes, `--team-viral` (#EC4899, hot pink) and `--sev-high` (#DC2626, red) can be overly saturated on the dark `#0A0A0A` background. PRD implies dark-mode readability for all tokens.

9. **components/arena-cards.tsx:408** — `ChampionHero` uses `border-champion` on its outer section. While this represents the champion winner UI (which is acceptable per PRD §2.1 for winner pills), the entire section card border being gold combined with the gold Trophy icon at line 409 and the `text-champion` creates excessive gold usage beyond the "winner pill" scope.

## MEDIUM

1. **tailwind.config.ts vs globals.css drift** — `tailwind.config.ts` defines `transitionDuration` and `transitionTimingFunction` maps, but globals.css's `@theme inline` block (lines 129-155) does NOT expose `--ease-*` or `--dur-*` tokens to Tailwind. Conversely, the `content` paths in tailwind.config.ts only scan `app/`, `components/`, and `lib/` but not `packages/`. If any package components exist that use design tokens, they won't be tree-shaken properly.

2. **components/header-actions.tsx:70** — Button transition `transition-colors duration-fast ease-ease-out` uses Tailwind utilities that map to token values, but there is no `prefers-reduced-motion` fallback at the component level. The global `--dur-fast` becomes `0ms` under reduced motion, but `transition-colors` may still trigger color interpolation at frame rate rather than instant snap.

3. **components/arena-cards.tsx:60** — Inline `style` with raw pixel values for avatar sizing (`width: 34, height: 34, etc.`). These should use `--s-*` spacing tokens or Tailwind size utilities for consistency.

4. **app/globals.css:263** — Raw hex `#263044` used for `.nav-tabs` text color. This is a hardcoded text color outside the token system. Should use `var(--fg)` or `var(--fg-muted)`.

5. **app/globals.css:339,362,363,364,368,369,370,380,391,412,418,445,461,462,489,490,496,497,501,502,506,507** — Extensive raw hex usage in the "legacy" component styles (lines 227-515). While these are marked as "out of scope for this issue" in a comment, they still ship in the bundle and violate the token system. Status pills (`.status-pill`, `.status-pill.live`, `.status-pill.done`, `.status-pill.neutral`) use hardcoded hex for text and background instead of token variables.

6. **components/arena-cards.tsx:178** — Status pill `done` tone uses `bg-team-infra/10 text-team-infra` which is correct, but the `live` tone uses `bg-status-ok/10 text-status-ok` — inconsistent mapping (team-infra vs status-ok for "done" vs "live"). Both green but from different token families.

7. **components/arena-cards.tsx:573** — `QuoteBand` uses `bg-team-viral/5 text-team-viral` which is a team identity color being used for a non-team UI element (a quote/highlight band). The viral pink should not be applied to generic UI surfaces.

8. **components/arena-cards.tsx:387** — `EventLog` hardcodes `bg-team-viral/10 text-team-viral` for all event type labels, regardless of event type. Every event gets the same viral-pink pill, losing semantic color coding.

9. **components/arena-cards.tsx:349** — Winner row highlight uses `bg-team-viral/5` (team viral, not champion). If the winner is not the viral team, this row is incorrectly highlighted with the wrong team color. Should use `--champion` or a neutral highlight.

10. **components/battle-setup-form.tsx:231** — `<select>` elements have `aria-label` but no `focus-visible` ring style defined in the legacy CSS. Form controls may lack visible keyboard focus.

11. **components/artifact-viewer.tsx:13** — Tab buttons have no `aria-selected` attribute despite using `role="tablist"`. This is an a11y gap for the tab pattern.

12. **components/attack-matrix.tsx** — While cells have `focus-visible` styling in CSS (line 1737), the self-cells (`attack-matrix-cell-self`) render as `<div>` not `<button>` and are `aria-hidden`, which is correct. However, there is no focus-visible styling on the column/row headers.

13. **app/globals.css (line 199, `:root` second block)** — A second `:root` block re-declares tokens like `--surface`, `--surface-soft`, `--blue`, `--purple`, `--green`, `--orange`, `--red` as aliases to design tokens. This creates two parallel naming systems for the same colors, increasing cognitive load and maintenance risk.

14. **components/arena-cards.tsx:38** — `teamColorMap` maps `orange` to `text-champion` — champion gold is being used as the "orange" team identity color. This conflates the champion semantic with a team identity, violating PRD §2.1.

## Summary

- Critical: 3, High: 9, Medium: 14
- Raw hex count: 85+ instances (globally; 2 in components/ui-kit/button.tsx for shipped component code)
- Files with focus-ring gap: components/ui-kit/card.tsx, components/header-actions.tsx (inputs), components/battle-setup-form.tsx (selects)
- Dark mode tokens missing overrides: --team-safe, --team-viral, --team-infra, --champion, --sev-low, --sev-med, --sev-high, --sev-fatal, --status-ok, --status-warn, --status-err, --status-info
- Reduced-motion gaps: components/ui-kit/button.tsx (hardcoded 600ms spinner animation), components/ui-kit/card.tsx (transform transition)
- Missing alpha tokens: --champion-08, --sev-low-08, --sev-med-08, --sev-high-08, --sev-fatal-08 (Badge and SeverityTag use raw rgba instead)
- Champion gold misuse: battle-replay-client.tsx (event markers), arena-cards.tsx (orange team identity, winner section border)
- Build status: PASS (pnpm build completes successfully)