# Adversarial Review — POST /api/battles

Date: 2026-07-10
Reviewer: reviewer-9-post-battles

Scope: `app/api/battles/route.ts`, `lib/api/guards.ts`, `lib/db/repo/battle-repo.ts` (does not exist — insert is inline in route), `lib/db/schema.ts` (battle table, `mode` column), `app/api/battles/route.test.ts`

---

## CRITICAL

1. **race condition between idempotency check and insert (TOCTOU) — two parallel POSTs with the same idea create two battles**

   `app/api/battles/route.ts:60-95` — The handler does `SELECT` for existing battle by `idea`, then `INSERT` if not found. There is no `UNIQUE` constraint on `battle.idea` in the schema (`lib/db/schema.ts:144-175` — `battle` table has no unique index on `idea`). Two concurrent requests with the same idea will both pass the `SELECT`, both compute the same `battleId` via `makeBattleId()`, and both attempt `INSERT`. The second `INSERT` will either crash with a PK collision on `id` (because both compute the same `btl_` hash) or, worse, if `makeBattleId` ever diverges, create two distinct battles for the same idea — violating the idempotency contract entirely. The error on insert is silently swallowed (line 97-99), so the client gets a success response with a battle_id that may not exist in the DB.

2. **input validation has no trim before length check — 10 spaces passes Zod `.min(10)`**

   `app/api/battles/route.ts:20-26` — The Zod schema checks `idea.min(10)` on the raw string, not the trimmed string. The `validateIdea` function in `lib/api/guards.ts:44-64` correctly trims before checking, but the route handler **does not use `validateIdea`** — it uses its own Zod schema. This means `"          "` (10 spaces) passes validation, is used to compute `battleId`, is stored in the DB as `idea: "          "`, and appears in the title as empty whitespace. The engine downstream (`runBattleFromPayload` → `normalizeBattleCreateInput`) trims and rejects empty ideas, so the DB row references a battle that the engine cannot actually run with.

3. **no rate limiting applied to POST /api/battles**

   `app/api/battles/route.ts:28-30` — The handler logs a TODO comment and skips rate limiting entirely. The `withRateLimit` wrapper exists in `lib/api/guards.ts:105-136` and is used by other routes (e.g. `app/api/battles/[id]/start/route.ts:40`), but this route does not use it. An unauthenticated client can send unlimited POSTs, each causing a DB query and insert attempt. This is a denial-of-service vector.

---

## HIGH

1. **idempotency check uses `eq(battle.idea, idea)` — full-table scan with no index on `idea`**

   `app/api/battles/route.ts:62-66` — The `SELECT ... WHERE idea = $1` query has no backing index. The `battle` table schema (`lib/db/schema.ts:169-174`) defines indexes on `status`, `trial_template_id`, `type`, and `created_at` — but not on `idea`. Every POST triggers a sequential scan over the entire `battle` table. At scale (hundreds/thousands of battles), this becomes a slow full-table scan per request, and the query planner will never use an index.

2. **insert error is silently swallowed — client gets 201 for a battle that was never persisted**

   `app/api/battles/route.ts:96-100` — When the DB insert fails (e.g., unique constraint violation, connection error, disk full), the handler catches the error, logs a warning, and still returns `201 Created` with the `battleId`. The client believes the battle exists and proceeds to call `POST /api/battles/[id]/start`, which will fail because the battle row is absent. There is no way for the client to distinguish a successful create from a silently-failed create.

3. **no `Location` header on 201 response — violates REST semantics for resource creation**

   `app/api/battles/route.ts:105-112` — REST convention for `201 Created` is to include a `Location` header pointing to the newly created resource. The response sets status `201` but provides no `Location: /api/battles/{battleId}` header. Clients that follow REST conventions to discover the resource URL from the response will be unable to do so.

4. **idempotency response returns 200 but should return 200 only for the *first* successful create — subsequent identical requests return 200 with the same body shape, making it indistinguishable from the original 201 create**

   `app/api/battles/route.ts:68-73` — When a duplicate idea is found, the response is `{ battleId, status: "created" }` with status `200`. The original create also returns `{ battleId, status: "created" }` (line 107-111). The only way to distinguish "newly created" from "already existed" is the HTTP status code (201 vs 200), which is correct, but the `status: "created"` field in the body is misleading on a duplicate — it should be `"existing"` or `"duplicate"`. The test at line 131-142 even asserts `body.status` is `"created"` on a duplicate, baking this bug into the test suite.

5. **rate limiter key uses `x-forwarded-for` without validation — spoofable for rate-limit bypass**

   `lib/api/guards.ts:85-94` — `getClientKey` takes the first value of `x-forwarded-for` header without any validation. An attacker can send `x-forwarded-for: 1.1.1.1` on every request to get a unique key each time, bypassing the rate limit entirely. This is not exploitable on the current route (which doesn't use `withRateLimit`), but the guard itself is vulnerable.

---

## MEDIUM

1. **Zod schema does not enforce no-control-chars (available guard is bypassed)**

   `app/api/battles/route.ts:20-26` — The `validateIdea` function in guards.ts checks for control characters (`lib/api/guards.ts:36, 59-61`), but the route's Zod schema only checks length. The `withInputValidation` wrapper exists in guards.ts:149-174 but the route does not use it. An idea like `"hello\x00world padded to ten"` passes Zod validation but contains a null byte that will be stored in the DB and may cause issues in downstream rendering/logging.

2. **error response shapes are inconsistent across the handler**

   - JSON parse failure: `{ error: "Invalid JSON body" }` (line 38)
   - Zod validation failure: `{ error: "Validation failed", issues: [...] }` (line 48-49)
   - Successful create: `{ battleId, status: "created", battle: { id } }` (line 106-110)
   - Idempotency hit: `{ battleId: existing[0].id, status: "created" }` (line 69-71) — note: no `battle` key here, inconsistent with the create response

   The idempotency hit response is missing the `battle: { id: ... }` field that the create response includes. Clients that read `data.battle?.id` (as noted in the comment on line 104) will get `undefined` on a duplicate request.

3. **no `Idempotency-Key` header support — clients cannot safely retry on network failure**

   The route does not accept or process an `Idempotency-Key` header. If a client's POST fails with a network timeout, retrying the same request may create a second battle (if the first one was persisted but the response was lost). Standard practice for create endpoints is to accept an `Idempotency-Key` header and dedup on it.

4. **`settingsJson` stores `{ mode }` but the engine (`runBattleFromPayload`) reads `settings.battleType`, `settings.timeLimit`, etc. — the `mode` field in settingsJson is dead data**

   `app/api/battles/route.ts:83` stores `{ mode }` in `settingsJson`, but `normalizeBattleCreateInput` in `lib/battle-api.ts:33-49` reads `settings.battleType`, `settings.timeLimit`, `settings.preference`, `settings.outputTargets` — none of which are `mode`. The `mode` is also stored in a dedicated `mode` column (line 94), so it appears in two places: the column and `settingsJson`. If the engine ever reads `settingsJson.mode`, it will get the value; if it reads `settings.mode` (without `Json`), it will get `undefined`. This is a data redundancy and consistency hazard.

5. **logging includes the raw idea text — PII risk**

   `app/api/battles/route.ts:30` logs `"rate-limit check skipped"` (no PII), but the error handlers at line 77 and 99 log the raw `dbErr` object which, depending on the Drizzle error implementation, may include the query and bound parameters (i.e., the idea text). If users submit ideas containing personal information, this gets written to server logs. No log redaction is applied.

6. **`battle.type` is hardcoded to `"hackathon"` — no way to create other battle types**

   `app/api/battles/route.ts:90` — Every battle is inserted with `type: "hackathon"`. The schema allows `varchar(50)` for `type`, and the `battleTypes` enum in `lib/battle-api.ts` includes other options, but the route hardcodes one value. This is a design limitation, not a bug per se, but it means the `type` column is always `"hackathon"` and provides no information.

---

## Summary

- **Critical: 3** — TOCTOU race, no-trim validation bypass, no rate limiting
- **High: 5** — unindexed idea query, swallowed insert errors, missing Location header, idempotency response inconsistency, spoofable rate-limit key
- **Medium: 6** — control-char bypass, inconsistent error shapes, no Idempotency-Key, mode data redundancy, PII in logs, hardcoded type
