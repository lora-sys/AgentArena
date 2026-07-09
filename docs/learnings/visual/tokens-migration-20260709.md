# Tokens Migration — Sprint 0 / Issue #10

**Date**: 2026-07-09
**Agent**: UI/UX Designer
**Issue**: #10 — Migrate existing components/* to design tokens

## Scope delivered

- CSS variables injected into `app/globals.css` from `docs/design.md` §2.1–2.4 (color, typography, space/radius/shadow, motion).
- `@media (prefers-color-scheme: dark)` override applied to color tokens.
- `@media (prefers-reduced-motion: reduce)` override applied to motion durations.
- `:root` reset added (box-sizing, body, links, form controls).
- `@theme inline` block exposes CSS variables as Tailwind v4 utility tokens.
- `tailwind.config.ts` created with extended theme: `colors`, `fontFamily`, `spacing`, `borderRadius`, `boxShadow`, `transitionDuration`, `transitionTimingFunction` — all referencing CSS variables.

## Components touched

| File | Action |
|---|---|
| `components/header-actions.tsx` | Rewrote with Tailwind classes mapping to tokens (`bg-bg-elev`, `border-border`, `text-fg`, `bg-team-safe`, etc.). No raw hex. |
| `components/arena-cards.tsx` | Rewrote 17 exports with Tailwind token classes. Team color mapped via `teamColorMap` (`blue→text-team-safe`, `purple→text-team-viral`, `green→text-team-infra`, `orange→text-champion`). Severity mapped via `severityTokenMap`. No raw hex. |

## Legacy CSS preserved

The old component-level CSS classes (`.topbar`, `.ghost-button`, `.home-hero`, `.section-card`, etc.) used by `app-shell.tsx`, `app/page.tsx`, `artifact-viewer.tsx`, `battles-table.tsx`, `replay-controls.tsx`, and `battle-setup-form.tsx` are preserved in a commented block at the bottom of `app/globals.css` under "Legacy component classes." These components are out of scope for this issue (hard rules: no touching them).

Legacy CSS variables (`--surface`, `--blue`, `--purple`, etc.) are aliased to the new tokens in a second `:root` block. This keeps the build green while token migration is phased.

## Build evidence

- `pnpm typecheck` → 0 errors
- `pnpm lint` (via `next lint`) → 0 errors, 0 warnings
- `pnpm build` → success, all routes compile

## Screenshot

- Path: `docs/learnings/visual/web-home-tokens-20260709.png`
- Viewport: 1440×900
- Captured: `pnpm dev` + `agent-browser screenshot`

## Notes

- Tailwind v4 uses CSS-based `@theme` directive for utility token generation. The `tailwind.config.ts` is still required for content scanning and is used to document the token mapping.
- Team color in components uses Tailwind text/border utilities rather than inline CSS to keep "no raw hex" rule enforceable via grep.
- Alpha overlays (`team-safe-08`, etc.) defined as CSS variables for future use by chips, focus halos, and gradients.
- Dark mode token overrides applied per `docs/design.md` §2.1.
- Reduced-motion zero-out applied per `docs/design.md` §2.4.
- Champion gold token reserved for badge/seal/winner-pill uses per design rules.
