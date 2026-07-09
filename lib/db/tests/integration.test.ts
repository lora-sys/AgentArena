// Integration test for the db schema.
// Uses pg-mem (in-memory Postgres) so the test runs without real DB credentials.
// pg-mem implements a large subset of Postgres SQL via node-postgres,
// which lets us exercise our schema end-to-end without any external service.
//
// Note: pg-mem is NOT production-grade Postgres. It is for tests/dev only.
// Production deploys use Neon serverless or a real Postgres instance.
//
// Why we use pg-mem's `public.query()` directly rather than wiring Drizzle's
// node-postgres driver into it:
//   pg-mem's bundled pg adapter throws on Drizzle's `types.getTypeParser`
//   stub, and its parameter-binding path is partial — it replaces $N
//   placeholders with literals in some paths and parses them as parameter
//   expressions in others. That's tolerable for "schema round-trip" tests
//   but not for full ORM coverage.
//
// For full ORM coverage, use a real testcontainers Postgres (`pnpm test:e2e`).

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { newDb, DataType, type IMemoryDb } from "pg-mem";

interface PgMemRow {
  [key: string]: unknown;
}

let pgMem: IMemoryDb;

/**
 * Run a single SQL statement and return the rows.
 * Mimics enough of the `pg` Pool API for tests that don't need Drizzle.
 *
 * pg-mem compatibility:
 *   - Uses single-quoted string literals (pg-mem tokenizes double-quotes
 *     as identifiers, not string literals).
 *   - Drops PG-only casts like `::jsonb` from inline substitutions because
 *     pg-mem's lexer chokes on `"..."::jsonb` after JSON.stringify output.
 *   - Pre-substitutes $N before calling pgMem.public.query() to avoid the
 *     incomplete parameter-binding path in pg-mem.
 *   - Any statement with a RETURNING clause (INSERT/UPDATE/DELETE) returns
 *     its rows; SELECTs always return rows; bare DDL statements return [].
 */
async function sql(
  text: string,
  values: unknown[] = [],
): Promise<PgMemRow[]> {
  const trimmed = text.trim();
  const hasReturning = /\breturning\b/i.test(trimmed);
  const isSelect = /^\s*(select|with)\b/i.test(trimmed);
  const returnsRows = isSelect || hasReturning;

  // If no values supplied and it's already a select, run as-is.
  if (values.length === 0 && isSelect) {
    return pgMem.public.query(text).rows as PgMemRow[];
  }

  // Substitute $N -> quoted literals, dropping any ::TYPE cast that follows.
  // Examples:
  //   $1                  -> 'foo'
  //   $5::jsonb           -> '{...}'
  //   $3::battle_status   -> 'idle'
  const formatted = text.replace(
    /\$(\d+)(?:::("[^"]+"|[a-zA-Z_][\w]*))?/g,
    (_match, n: string) => {
      const i = Number.parseInt(n, 10) - 1;
      if (i >= values.length) {
        throw new Error(`Parameter $${n} not found (have ${values.length})`);
      }
      const v = values[i];
      if (typeof v === "string") {
        // Escape single quotes by doubling them (Postgres convention).
        return `'${v.replace(/'/g, "''")}'`;
      }
      if (typeof v === "number" || typeof v === "boolean") {
        return String(v);
      }
      if (v === null || v === undefined) {
        return "NULL";
      }
      // Fallback: stringify as JSON inside single quotes.
      return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
    },
  );

  const result = pgMem.public.query(formatted);
  return returnsRows ? (result.rows as PgMemRow[]) : [];
}

beforeAll(async () => {
  // autoCreateForeignKeyIndices=true would create indexes that conflict with
  // the explicit CREATE INDEX statements in the migration. Disable so the
  // migration is the single source of truth.
  pgMem = newDb({ autoCreateForeignKeyIndices: false });

  // Register common Postgres helper functions that pg-mem does not ship by default.
  pgMem.public.registerFunction({
    name: "gen_random_uuid",
    returns: DataType.uuid,
    implementation: () =>
      "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }),
    impure: true,
  } as never);
  pgMem.public.registerFunction({
    name: "now",
    returns: DataType.timestamptz,
    implementation: () => new Date(),
    impure: true,
  } as never);

  // Apply the Drizzle-generated schema from lib/db/migrations/0000_*.sql
  // so the test exercises the exact column/foreign-key layout that ships.
  // The migration is loaded by file path to keep this test in sync with
  // any future schema changes — the source of truth is the generated SQL.
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const migrationsDir = path.resolve(__dirname, "../migrations");
  const files = (await fs.readdir(migrationsDir))
    .filter((f) => f.endsWith(".sql"))
    .sort();
  if (files.length === 0) {
    throw new Error(
      "No SQL migrations found. Run `pnpm db:generate` first.",
    );
  }
  for (const f of files) {
    const sqlText = await fs.readFile(path.join(migrationsDir, f), "utf8");
    const stmt = sqlText
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    for (const s of stmt) {
      try {
        pgMem.public.query(s);
      } catch (e) {
        throw new Error(
          `Failed to apply migration statement in ${f}: ${(e as Error).message}\nStatement:\n${s}`,
        );
      }
    }
  }
});

afterAll(() => {
  pgMem = undefined as unknown as IMemoryDb;
});

describe("db schema — battle round-trip", () => {
  it("inserts a battle row and reads it back with correct shape", async () => {
    const settings = {
      battleType: "hackathon",
      timeLimit: "48h",
      preference: "balanced",
      outputTargets: [
        "product_brief",
        "prd",
        "architecture",
        "demo_script",
        "pitch_outline",
        "todo",
      ],
    };

    const insertSql = `
      INSERT INTO battle
        (title, idea, type, status, original_input, settings_json)
      VALUES
        ($1, $2, $3, $4, $5::jsonb, $6::jsonb)
      RETURNING id, title, idea, type, status, created_at, settings_json
    `;
    const inserted = await sql(insertSql, [
      "Hackathon 2026 Demo",
      "AI-powered code reviewer for TypeScript repos",
      "hackathon",
      "briefing",
      JSON.stringify({ goal: "ship a demo in 48h" }),
      JSON.stringify(settings),
    ]);

    expect(inserted).toHaveLength(1);
    const row = inserted[0]!;
    expect(row.id).toBeTypeOf("string");
    expect(row.title).toBe("Hackathon 2026 Demo");
    expect(row.status).toBe("briefing");
    expect(row.idea).toBe("AI-powered code reviewer for TypeScript repos");
    expect(row.type).toBe("hackathon");

    // Read it back.
    const rows = await sql(
      `SELECT id, idea, type, settings_json FROM battle WHERE id = $1`,
      [row.id as string],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]!.id).toBe(row.id);

    // settings_json comes back as a JSON object.
    const s = rows[0]!.settings_json as { battleType: string };
    expect(s.battleType).toBe("hackathon");
  });

  it("supports inserting a battle_event tied to a battle", async () => {
    const battleRows = await sql(
      `INSERT INTO battle (title, idea, type, status, original_input, settings_json)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb) RETURNING id`,
      [
        "Event Test Battle",
        "Test idea",
        "hackathon",
        "proposal_round",
        "{}",
        "{}",
      ],
    );
    const battleId = battleRows[0]!.id as string;
    expect(battleId).toBeTypeOf("string");

    const eventRows = await sql(
      `INSERT INTO battle_event
         (battle_id, sequence, round, type, actor_type, actor_id, target_id, payload_json)
       VALUES
         ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
       RETURNING id, battle_id, actor_type, round, payload_json`,
      [
        battleId,
        1,
        "proposal_round",
        "proposal_created",
        "agent",
        "team_safe_builder_v1",
        "battle",
        JSON.stringify({ foo: "bar" }),
      ],
    );

    expect(eventRows).toHaveLength(1);
    const evt = eventRows[0]!;
    expect(evt.battle_id).toBe(battleId);
    expect(evt.actor_type).toBe("agent");
    expect(evt.round).toBe("proposal_round");
    expect((evt.payload_json as { foo: string }).foo).toBe("bar");
  });
});

describe("db schema — enums and constraints", () => {
  it("all expected tables exist in public schema", async () => {
    const expected = [
      "trial_template",
      "battle",
      "agent_definition",
      "battle_participant",
      "proposal",
      "attack",
      "defense",
      "score",
      "artifact",
      "battle_event",
      "passport_snapshot",
      "model_call_log",
    ].sort();
    const rows = await sql(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' ORDER BY table_name`,
    );
    const actual = rows.map((r) => r.table_name as string).sort();
    expect(actual).toEqual(expected);
  });

  it("battle.status enum accepts the documented statuses", async () => {
    // Verify each status is accepted as a value (smoke test).
    const statuses = [
      "idle",
      "briefing",
      "team_generation",
      "proposal_round",
      "cross_attack_round",
      "defense_round",
      "judging_round",
      "artifact_generation",
      "replay_generation",
      "completed",
      "failed",
      "retrying",
      "cancelled",
    ];
    for (const status of statuses) {
      const rows = await sql(
        `INSERT INTO battle (title, idea, type, status, original_input, settings_json)
         VALUES ($1, $2, $3, $4::battle_status, $5::jsonb, $6::jsonb) RETURNING status`,
        [
          `battle-${status}`,
          "enum test",
          "hackathon",
          status,
          "{}",
          "{}",
        ],
      );
      expect(rows[0]!.status).toBe(status);
    }
  });
});
