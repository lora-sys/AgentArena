# UI And React Bits Guide

## Purpose

Use this document when implementing Agent Arena UI from the `ui/` screenshots and deciding where React Bits belongs.

Do not use it for product scope; use [prd.md](prd.md). Do not use it for implementation order; use [development-plan.md](development-plan.md). Do not use it for acceptance gates; use [acceptance-standards.md](acceptance-standards.md).

## Current Visual Source

The visual target is the screenshot set in `ui/`:

- `landingpage.png`
- `battle-settingup.png`
- `battle.png`
- `battle-1.png`
- `battle-2.png`
- `teams.png`
- `battles.png`
- `passport.png`

These screens define the first MVP look: bright tactical arena, clean white surface, blue/purple/green team identity, compact cards, timeline rail, score sparklines, replay surfaces, and passport metrics.

## React Bits Decision

React Bits should be used as a source-copied enhancement layer, not as the whole design system.

Use it for:

- Animated team cards.
- Score reveal moments.
- Replay transitions.
- Timeline step emphasis.
- Champion reveal.
- Passport metric polish.
- Subtle battle-stage background texture.

Do not use it for:

- Core forms.
- Tables.
- Standard navigation.
- Data validation.
- Business logic.
- Anything that makes the MVP depend on heavy shaders before the static shell is stable.

## Candidate React Bits Components

Use official component pages as the install source at implementation time. Verified component families include components, animations, text animations, and backgrounds, with JS/TS and CSS/Tailwind variants.

Recommended first picks:

- `BorderGlow`: champion card and active team card.
- `SpotlightCard`: proposal and attack cards.
- `Stepper`: battle setup and round progress.
- `CountUp`: score reveal.
- `AnimatedList`: event log and judge comments.
- `TiltedCard`: passport or team profile card, only if it remains subtle.
- `DotGrid` or `Radar`: background accent in the battle stage, never full-page noise.

Avoid first:

- Heavy 3D scenes.
- Full-screen shader backgrounds.
- Cursor effects that distract from reading.
- Components that require complex media assets before the MVP works.

## UI Contracts

- Cards stay at 8px radius or less unless the screenshot target clearly differs.
- Text must fit on desktop and mobile.
- The app should feel like a battle room, not a generic dashboard.
- Game-like moments are allowed; childish decoration is not.
- Team colors are semantic: Safe Builder blue, Viral Designer purple, Infra Hacker green, Judge orange/neutral.
- Every important animation must respect reduced motion.
- Data-dense pages such as Battles and Passport should prioritize scanning.

## Screenshot Moments

The MVP must preserve these:

1. Three teams entering.
2. Proposal comparison.
3. Cross Attack cards.
4. Judge Scoreboard.
5. Champion Reveal.
6. Battle Replay.
7. Agent Passport.

## Implementation Note

When the app scaffold exists, copy React Bits components into local source and adapt them to project tokens. Do not import remote code at runtime. Do not add a React Bits component until the target route already works with static data.
