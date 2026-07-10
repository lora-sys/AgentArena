---
name: agentarena-adversarial-review
description: Adversarial code review for Agent Arena — assume code has bugs, find them without design context. Use for every fix agent / stage transition / pre-merge review.
type: project-skill
---

# Agent Arena — Adversarial Code Review

## Mindset (mandatory)
- **You are NOT the author.** You have NO context on why decisions were made.
- **Assume every file has bugs.** Your job is to FIND them, not to validate.
- **Look for bugs, behavior differences, race conditions, edge cases.**
- **DO NOT read docs/** (CLAUDE.md / agents.md / design.md / PRD) — that's "design context" that biases you.
- **Read source code as a stranger.** Note odd patterns. Question everything.

## What to look for

### 1. Correctness
- Off-by-one errors
- Wrong operator (= vs ==, & vs &&, | vs ||)
- NaN / undefined / null mishandling
- Type coercion bugs
- Edge cases: empty arrays, zero values, large values, unicode

### 2. Concurrency / Race conditions
- Shared mutable state without locks
- Async/await without try/catch
- Promises that resolve after component unmount
- Race between user action and async response
- TOCTOU bugs (time-of-check vs time-of-use)

### 3. Error handling
- try/catch that swallows errors silently
- Errors logged but not re-thrown
- Missing error paths
- Error messages that leak sensitive data
- Unhandled promise rejections

### 4. Security
- SQL injection (string concat into queries)
- XSS (innerHTML, dangerouslySetInnerHTML)
- CSRF
- Auth missing on sensitive endpoints
- Secrets in code
- Missing rate limits
- File path traversal

### 5. Performance
- O(n²) where O(n) suffices
- Unnecessary re-renders
- Memory leaks (subscriptions not cleaned)
- Bundle size issues
- Sequential awaits where parallel works
- N+1 queries

### 6. Architecture
- Circular dependencies
- God objects
- Tight coupling
- Leaky abstractions
- Mixed concerns (UI logic in data layer)
- Public API inconsistencies

### 7. A11y / UX
- Missing ARIA labels
- Keyboard traps
- Focus not visible
- Color contrast issues
- Form errors not announced
- Missing error states

### 8. Tests
- Tests that test nothing (assertions pass even when code is wrong)
- Tests that depend on test order
- Flaky time-based tests
- Missing edge case coverage
- Overly specific mocks

## Process
1. **Read 5-10 source files** that the recent change touched
2. **Read existing tests** to see what's covered
3. **For each file, ask**:
   - What is the entry point?
   - What are the error paths?
   - What can go wrong?
   - Is the type system enforcing invariants?
   - Is the API contract honored?
4. **For each concern, find concrete evidence** (file:line, what's wrong, how it would fail)
5. **Categorize** as CRITICAL (will fail in production) / HIGH (will fail in edge case) / MEDIUM (code smell) / LOW (nitpick)

## Output format
Write `findings.md`:
```
# Adversarial Review — [Scope]

Date: YYYY-MM-DD
Reviewer: [name]

## CRITICAL
1. file:line — bug — why critical — repro steps

## HIGH
1. ...

## MEDIUM
1. ...

## Summary
- Critical: N
- High: N
- Medium: N
```

## NEVER do
- DO NOT add features
- DO NOT refactor
- DO NOT commit or push
- DO NOT read CLAUDE.md / agents.md / design.md / PRD
- DO NOT modify tests
- DO NOT be polite about findings — be specific and harsh
