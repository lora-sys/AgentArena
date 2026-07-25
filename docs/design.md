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

Artifact version presentation uses a two-column verified-code comparison beside a self-contained Mini App preview. Below 900px the preview stacks after the comparison; below 600px the two versions also stack, while the modal itself owns vertical scrolling.

Artifact detail tabs preserve evidence semantics: patch rows align deleted and added lines in two columns, test results keep the six-column contract in a locally scrollable table, and evidence links close the modal before briefly pinning and focusing the selected Event Stream record.

Live-runtime Artifact degradation borrows the centered warning hierarchy and restrained cyan recovery CTA from the Live AI Degraded frame. It removes unavailable tabs, explicitly labels the missing payload, and never presents verified fixture content until mode has changed back to `verified_replay`.

Evidence Lens uses a two-column audit surface: six dimension cards on the left and a numbered event chain on the right. `linked_evidence` exposes only the first attributable line per dimension; `insufficient_evidence` removes all score detail and desaturates the surface so fixed replay evidence cannot masquerade as live evidence.

Champion is one continuous page: a viewport-height 1200ms broadcast reveal leads into a dense Team Passport audit surface. Champion gold is concentrated in the verified winner, seal, score accents, and journey spine; strengths, weaknesses, and improvements remain separately legible through success, danger, and champion semantics. Mobile removes runner-up portraits and stacks the six scores, trait cards, and journey without page-level horizontal scrolling.

Mini Passport is the honest live-partial counterpart to Champion: a centered cyan status card replaces both victory reveal and verified score content. It renders immediately while the event store is checked, distinguishes “waiting for events” from “events recorded,” and offers explicit routes back to the live battle or across to the verified showcase.

## Visual QA

Check 1440×900 and 390×844, compare against the reference, exercise all primary controls, inspect console errors, and run the Example Battle three times before a demo release.
