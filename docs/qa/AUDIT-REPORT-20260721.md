# Agent Arena — Audit Report (2026-07-21)

> Full E2E audit using agent-browser + curl + manual page exploration.
> Goal: find real bugs (not synthetic) and plan what to fix for hackathon demo.

## Executive summary

The **frontend narrative** is dramatically better after the 2026-07-21 redesign — 5 core pages (Home / Live / Result / Passport / Setup) now have real cinematic feel. But the **backend lies** about being "agent product" — every new battle is a zombie. There are also 4 missing pages and fabricated stats across the list views.

**Verdict:** Hackathon-ready on the surface, **broken in the engine room.** Fix the backend before the demo.

---

## Routes verified (HTTP 200)

| Route | Status | Notes |
|---|---|---|
| `/` | 200 ✅ | Cinematic hero + arena + live ticker |
| `/battle/new` | 200 ✅ | Form → API → `/battle/[id]/live` works |
| `/battle/demo/live` | 200 ✅ | Cinematic stage + battle stream |
| `/battle/demo/result` | 200 ✅ | Podium ceremony + audit trail |
| `/battle/demo/replay` | 200 ✅ | Replay view |
| `/teams` | 200 ⚠️ | 5 real teams but **fake stats** |
| `/battles` | 200 ⚠️ | **Fake data** + battle rows are invented |
| `/agent/viral-designer/passport` | 200 ✅ | Premium audit document |
| `/agent/safe-builder/passport` | 200 ✅ | |
| `/agent/infra-hacker/passport` | 200 ✅ | |
| `/battle/[id]/live` (dynamic) | 200 ❌ | **"Reconnecting..." forever** |
| `/explore` | 404 ❌ | Nav link is broken |

---

## 🔴 CRITICAL bugs (must fix before demo)

### C1. New battles never run — backend creates DB row but never runs engine

**Repro:**
1. Visit `/battle/new`
2. Submit form
3. Land on `/battle/[id]/live` → "Reconnecting..." forever, no events

**Evidence:**
```bash
# POST works, returns battle ID
$ curl -X POST -d '{"idea":"Test idea for battle - must be at least 10 chars"}' /api/battles
{"battleId":"btl_756QCQHX","status":"created","inMemory":true}

# But the status is "unknown", all teams "pending"
$ curl /api/battles/btl_756QCQHX/status
{"battleId":"btl_756QCQHX","totalRounds":8,"round":1,"progress":0,
 "canCancel":true,"status":"unknown","agentStates":{
   "safe-builder":{"state":"pending","streamedText":"","score":0}, ...}}

# SSE stream returns HARD-CODED demo data, not the new battle
$ curl /api/battles/btl_756QCQHX/events/stream | head -5
event: brief_created
data: {"id":"event_001","battleId":"battle-42",...}  ← battle-42, not 756QCQHX
```

**Root cause:**
- `app/api/battles/route.ts:80-95` — POST only inserts DB row, never calls engine
- `app/api/battles/[id]/events/route.ts:20` — `getDemoBundle()` ignores the requested battleId
- `app/api/battles/[id]/events/stream/route.ts` — same, returns hardcoded demo events
- `app/battle/[id]/live/page.tsx` — uses `live-battle-client.tsx` which polls SSE, gets demo data, but the live-battle-client is hardcoded to assume the demo battle

**The lie is in 3 routes:** all per-battle APIs return the demo bundle.

### C2. `/explore` route is 404

**Repro:** Click "Explore" in the top nav.

**Evidence:**
```bash
$ curl /explore
{"error":"This page could not be found."}
```

**Root cause:** `app/explore/page.tsx` doesn't exist. The nav link in `app-shell.tsx` is broken.

### C3. `/battles` page is mostly fake data

**Repro:** Visit `/battles` → see "Total Battles 42", "12% vs last 30 days", "Top Team Safe Builder 61% win rate" — **none of this is real data**. The table rows show invented battle ideas ("How might we build a privacy-first AI copilot…") with hardcoded team winners.

**Root cause:** `app/battles/page.tsx` is a static client component that uses a hardcoded `battles` array and computed fake statistics. No DB read.

### C4. `/teams` page has fake "stats strip"

**Repro:** Visit `/teams` → see "Average Win Rate 68.7%", "Top Specialty Tech Offensive", "Recent Battles 24", "Total Teams 5".

**Root cause:** `app/teams/page.tsx:14-18` — `MiniStat` components hardcode these values. The real team data (5 teams with names + skills + colors) is below.

### C5. Dynamic live page (`/battle/[id]/live`) is permanently stuck

**Repro:** Submit form → land on `/battle/btl_X/live` → "Reconnecting..." badge, no events, all 3 teams "Pending / Waiting for turn…".

**Root cause:** This uses `components/live-battle-client.tsx` which polls `/api/battles/[id]/status` and connects SSE to `/api/battles/[id]/events/stream`. Both routes return demo data (per C1). But the live-battle-client is also designed for the demo battle — it has hardcoded `time=1:13 elapsed` and shows `Round 1 of 8` (8 rounds is for the engine, not the demo which is 6 rounds).

---

## 🟡 MEDIUM bugs

### M1. Live page counter shows wrong elapsed time

After submitting form, "1:13 elapsed" appears even though battle just started. The counter is hardcoded to start at `1:13`.

### M2. `Round 1 of 8` on live page but demo has 6 rounds

`/battle/demo/live` shows "Round 2: Cross Attack" (correct). `/battle/[id]/live` shows "Round 1 of 8" (engine, not demo). Two different round systems are exposed to users.

### M3. Cancel button is permanently visible on new live page

The cancel button is supposed to hide when `canCancel: false`, but the dynamic live page shows it for the broken zombie battle.

### M4. `/teams` team cards lack "View Details" target

Cards say "View Details →" but the link goes to `passport` which only works for 3 teams (not Judge Panel / Artifact Writer).

### M5. AppShell "Explore" link points to wrong URL

```tsx
{ id: "explore", label: "Explore", href: currentBattleId ? `/battle/${currentBattleId}/replay` : "/battles" }
```

On `/battle/new`, `currentBattleId` is `null`, so it points to `/battles` (not `/explore`).

---

## 🟢 What works (verified)

| Page | Element | Verified |
|---|---|---|
| Home | Cinematic hero | ✅ |
| Home | Triangle arena with 3 teams + judge hub | ✅ |
| Home | Live ticker with real events | ✅ |
| Home | Six rounds timeline + real attack evidence | ✅ |
| Home | Dark CTA "Stop guessing. Let them fight." | ✅ |
| Live (demo) | Red live-pulse status bar | ✅ |
| Live (demo) | 3 stage cards with colored borders + Streaming | ✅ |
| Live (demo) | Real battle stream (12 events) | ✅ |
| Result | Podium ceremony with gold medal | ✅ |
| Result | Champion hero 3-column | ✅ |
| Result | Three judges quote | ✅ |
| Passport | PASSPORT watermark + serial | ✅ |
| Passport | 80px gold seal | ✅ |
| Passport | Evidence chain with real event IDs | ✅ |
| Setup | "Summon the arena" hero | ✅ |
| Setup | Three team roster slide-in | ✅ |
| Mobile (390px) | All pages responsive | ✅ |

---

## 🎯 Agent product experience scorecard

User said: **"Show AI doing work, not promise it."** Current state:

| Promise | Delivery | Verdict |
|---|---|---|
| Three AI teams battle | Three hardcoded bundles | ❌ LIE |
| Live event stream | Static demo data | ❌ LIE |
| Agent Passport Snapshot | Hardcoded in demo bundle | ⚠️ STATIC |
| Replayable evidence | 29 fake events | ⚠️ STATIC |
| Score by judge | 6 hardcoded rubric values | ⚠️ STATIC |

**The "agent" in our product name is a lie.** Until C1 is fixed, this is a deterministic story app, not an AI product.

---

## 🛠️ Proposed fix priority

### Phase A — Backend truthfulness (4 hours, demo-blocker)
1. **A1**: When POST /api/battles is called, **trigger `runBattleFromPayload` immediately** (synchronously since the engine is in-memory). Persist result to DB. This is the demo path.
2. **A2**: Fix `/api/battles/[id]/events` and `/events/stream` to read from the actual stored battle, not the demo bundle.
3. **A3**: Update `/api/battles/[id]/status` to return real round progress based on battle events.
4. **A4**: When user submits form, **show live progress immediately** — a "Summoning agents..." state, then "Briefing...", then "Proposals streaming..." instead of "Reconnecting...".

### Phase B — Missing pages (3 hours)
5. **B1**: Build `/explore` as a "Battle Replay Hub" — featured replays, most-attacked proposals, recent champions.
6. **B2**: Rebuild `/battles` to read from DB (after A1) and show real battles.
7. **B3**: Remove fake stats from `/teams` (or compute from real data).

### Phase C — Design system + mobile (3 hours)
8. **C1**: Extract reusable components from `arena-cards.tsx` into `components/ui/`. (Punted for now.)
9. **C2**: Verify all redesigned pages on mobile (390px).

### Phase D — Polish (2 hours)
10. **D1**: Round-progress emoji/badges in rail.
11. **D2**: "Replay this battle" CTA on live page.
12. **D3**: Animation micro-interactions on click.

---

## Memory persists

Saved to `memory/2026-07-21-full-redesign.md`. Rules in `docs/CLAUDE.md` §17-21.
