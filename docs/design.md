# Current visual system

Agent Arena uses a dark sports-broadcast interface: navy-black surfaces, thin evidence borders, cyan/pink/amber team signals, Archivo Black headlines, Inter body copy, and IBM Plex Mono telemetry.

The authoritative visual and motion specifications are the engineering brief and browser prototype in `prototype/`. Current reviewed captures live in `docs/visual-reference/current/`; `legacy/` is historical reference only.

## Core layout contracts

- Landing: statement and autoplay mini battle; three agents remain visually simultaneous.
- Live Battle: three fighter cards on desktop, horizontal internal card rail on mobile, plus evidence chain.
- Replay: round rail, battle stage, inspector, and derived stats.
- Passport: identity, reputation trend, strengths/weaknesses, and evidence links.
- Archive: dashboard summary and replayable battle records on one route.

## Tokens and behavior

Runtime tokens and responsive rules live in `apps/web/src/styles.css` and `apps/web/src/styles/tokens.css`. Visible status must not rely on color alone. Motion respects `prefers-reduced-motion`. Modal surfaces use the shared 60% black overlay and 350ms fade-and-scale token. Page-level horizontal overflow is forbidden at 390px; intentional fighter/template rails own their own horizontal scrolling.

Do not introduce Storybook or a second UI kit without a concrete reuse need. Prefer existing components and contracts in `apps/web/src/components`.

## Visual QA

Check 1440×900 and 390×844, compare against the reference, exercise all primary controls, inspect console errors, and run the Example Battle three times before a demo release.
