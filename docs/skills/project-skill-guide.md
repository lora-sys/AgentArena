# Project Skill Guide

## Purpose

This is the project-specific skill map for Agent Arena. Use it when an agent needs to decide which local document to apply for a task.

Do not use this as a replacement for the docs it points to. It is a router.

## Skill: Product Scope

Use when:

- Deciding what the product is.
- Checking MVP vs long-term vision.
- Explaining Agent Arena positioning.

Read:

- [../prd.md](../prd.md)
- [../mvp-spec.md](../mvp-spec.md)

Do not use when:

- Debugging implementation. Use [../debugging-manual.md](../debugging-manual.md).
- Reviewing commands. Use [review-skill-guide.md](review-skill-guide.md).

## Skill: Build Planning

Use when:

- Choosing next implementation step.
- Splitting work into phases.
- Avoiding premature marketplace/protocol work.

Read:

- [../development-plan.md](../development-plan.md)
- [../validation-goals.md](../validation-goals.md)

Do not use when:

- Changing runtime boundaries. Use [../architecture-contracts.md](../architecture-contracts.md).

## Skill: UI Implementation

Use when:

- Implementing pages from `ui/`.
- Choosing React Bits components.
- Checking screenshot-worthy states.

Read:

- [../ui-react-bits.md](../ui-react-bits.md)
- `ui/*.png`

Do not use when:

- Deciding product scope. Use [../prd.md](../prd.md).
- Adding data contracts. Use [../architecture-contracts.md](../architecture-contracts.md).

## Skill: Runtime Architecture

Use when:

- Implementing Battle Engine.
- Creating event log.
- Adding scoring.
- Adding agent invocation adapter.

Read:

- [../architecture-contracts.md](../architecture-contracts.md)
- [../mvp-spec.md](../mvp-spec.md)
- [../eve-agents.md](../eve-agents.md)

Do not use when:

- Styling UI. Use [../ui-react-bits.md](../ui-react-bits.md).

## Skill: Debugging

Use when:

- Something fails.
- A battle gets stuck.
- UI contradicts data.
- Startup breaks.

Read:

- [../debugging-manual.md](../debugging-manual.md)
- [../diagnostic-tools.md](../diagnostic-tools.md)

Do not use when:

- Writing postmortem lessons. Use [../failure-archaeology.md](../failure-archaeology.md).

## Skill: Change Control

Use when:

- Changing product contracts.
- Changing schemas.
- Changing scoring weights.
- Changing documented commands.

Read:

- [../change-control.md](../change-control.md)

Do not use when:

- Doing normal implementation within existing contracts.

## Skill: Acceptance

Use when:

- Deciding whether a task is done.
- Preparing demo.
- Reviewing MVP readiness.

Read:

- [../acceptance-standards.md](../acceptance-standards.md)
- [../validation-goals.md](../validation-goals.md)

Do not use when:

- Investigating why a check failed. Use [../debugging-manual.md](../debugging-manual.md).
