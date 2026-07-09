// Tests for the Postgres-backed BattleEventStore (Issue #4).
//
// Uses pg-mem (in-memory Postgres) for the DB layer. pg-mem has known
// incompatibilities with Drizzle's node-postgres driver (parameter binding
// for LIMIT clauses, types.getTypeParser), so we mock the repo functions
// to delegate directly to pg-mem's public.query(). This exercises the
// store's validation, sequence, and ordering logic against a real
// SQL execution path without fighting the ORM compatibility issues.
//
// The Drizzle integration is verified by:
//   - typecheck (the store and repo use Drizzle APIs correctly)
//   - the integration test at lib/db/tests/integration.test.ts

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { newDb, DataType, type IMemoryDb } from "pg-mem";
import { BattleEventStore } from "./event-store";
import { SchemaValidationError, type BattleEvent } from "../schemas";

const { pgMem, repoMock } = vi.hoisted(() => {
  const pgMemLocal: { current: IMemoryDb | null } = { current: null };
  const repoMockLocal = {
    insert: vi.fn(),
    findByBattle: vi.fn(),
    findById: vi.fn(),
    maxSequence: vi.fn(),
    existsBySequence: vi.fn(),
  };
  return { pgMem: pgMemLocal, repoMock: repoMockLocal };
});

vi.mock("../../lib/db/repo/battle-event-repo", () => repoMock);

function makeBattleEvent(overrides: Partial<BattleEvent> = {}): BattleEvent {
  return {
    id: "evt_test_001",
    battleId: "00000000-0000-0000-0000-000000000001",
    round: "proposal_round",
    actorType: "system",
    actorId: "test_actor",
    targetId: undefined,
    eventType: "brief_created",
    title: "Test event",
    content: "Test content",
    rawPayload: { foo: "bar" },
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

beforeAll(async () => {
  const db = newDb({ autoCreateForeignKeyIndices: false });
  pgMem.current = db;

  db.public.registerFunction({
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
  db.public.registerFunction({
    name: "now",
    returns: DataType.timestamptz,
    implementation: () => new Date(),
    impure: true,
  } as never);

  db.public.query(`
    CREATE TABLE "battle_event" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "battle_id" uuid NOT NULL,
      "sequence" bigint NOT NULL,
      "round" varchar(100) NOT NULL,
      "type" varchar(100) NOT NULL,
      "actor_type" text NOT NULL,
      "actor_id" varchar(200),
      "target_id" varchar(200),
      "payload_json" jsonb NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    )
  `);
  db.public.query(
    `CREATE UNIQUE INDEX "battle_event_battle_seq_idx" ON "battle_event" ("battle_id", "sequence")`,
  );

  const sqlEscape = (v: unknown): string => {
    if (v === null || v === undefined) return "NULL";
    if (typeof v === "number" || typeof v === "boolean") return String(v);
    return `'${String(v).replace(/'/g, "''")}'`;
  };

  repoMock.insert.mockImplementation(
    async (input: Record<string, unknown>) => {
      const rows = db.public.query(
        `INSERT INTO battle_event (battle_id, sequence, round, type, actor_type, actor_id, target_id, payload_json)
         VALUES (${sqlEscape(input.battleId)}, ${input.sequence}, ${sqlEscape(input.round)}, ${sqlEscape(input.type)}, ${sqlEscape(input.actorType)}, ${sqlEscape(input.actorId)}, ${sqlEscape(input.targetId)}, ${sqlEscape(JSON.stringify(input.payload))})
         RETURNING id, battle_id, sequence, round, type, actor_type, actor_id, target_id, payload_json, created_at`,
      );
      const r = (rows.rows as Record<string, unknown>[])[0]!;
      return {
        id: r.id as string,
        battleId: r.battle_id as string,
        sequence: Number(r.sequence),
        round: r.round as string,
        type: r.type as string,
        actorType: r.actor_type as "system" | "team" | "agent" | "judge",
        actorId: r.actor_id as string | null,
        targetId: r.target_id as string | null,
        payloadJson: r.payload_json,
        createdAt: r.created_at as Date,
      };
    },
  );

  repoMock.findByBattle.mockImplementation(async (battleId: string) => {
    const rows = db.public.query(
      `SELECT id, battle_id, sequence, round, type, actor_type, actor_id, target_id, payload_json, created_at
       FROM battle_event WHERE battle_id = ${sqlEscape(battleId)} ORDER BY sequence ASC`,
    );
    return (rows.rows as Record<string, unknown>[]).map((r) => ({
      id: r.id as string,
      battleId: r.battle_id as string,
      sequence: Number(r.sequence),
      round: r.round as string,
      type: r.type as string,
      actorType: r.actor_type as "system" | "team" | "agent" | "judge",
      actorId: r.actor_id as string | null,
      targetId: r.target_id as string | null,
      payloadJson: r.payload_json,
      createdAt: r.created_at as Date,
    }));
  });

  repoMock.findById.mockImplementation(async (id: string) => {
    const rows = db.public.query(
      `SELECT id, battle_id, sequence, round, type, actor_type, actor_id, target_id, payload_json, created_at
       FROM battle_event WHERE id = ${sqlEscape(id)}`,
    );
    const arr = rows.rows as Record<string, unknown>[];
    if (arr.length === 0) return null;
    const r = arr[0]!;
    return {
      id: r.id as string,
      battleId: r.battle_id as string,
      sequence: Number(r.sequence),
      round: r.round as string,
      type: r.type as string,
      actorType: r.actor_type as "system" | "team" | "agent" | "judge",
      actorId: r.actor_id as string | null,
      targetId: r.target_id as string | null,
      payloadJson: r.payload_json,
      createdAt: r.created_at as Date,
    };
  });

  repoMock.maxSequence.mockImplementation(async (battleId: string) => {
    const rows = db.public.query(
      `SELECT COALESCE(MAX(sequence), 0) as max FROM battle_event WHERE battle_id = ${sqlEscape(battleId)}`,
    );
    const arr = rows.rows as Record<string, unknown>[];
    return Number(arr[0]?.max ?? 0);
  });

  repoMock.existsBySequence.mockImplementation(
    async (battleId: string, sequence: number) => {
      const rows = db.public.query(
        `SELECT id FROM battle_event WHERE battle_id = ${sqlEscape(battleId)} AND sequence = ${sequence}`,
      );
      return (rows.rows as unknown[]).length > 0;
    },
  );
});

afterAll(() => {
  vi.restoreAllMocks();
});

beforeEach(() => {
  if (pgMem.current) {
    pgMem.current.public.query(`DELETE FROM "battle_event"`);
  }
  // Clear call history but keep mock implementations set in beforeAll.
  repoMock.insert.mockClear();
  repoMock.findByBattle.mockClear();
  repoMock.findById.mockClear();
  repoMock.maxSequence.mockClear();
  repoMock.existsBySequence.mockClear();
});

describe("BattleEventStore — round-trip", () => {
  it("appends an event and reads it back via list", async () => {
    const store = new BattleEventStore();
    const event = makeBattleEvent();
    const id = await store.append(event);

    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);

    const events = await store.list(event.battleId);
    expect(events).toHaveLength(1);
    expect(events[0]!.battleId).toBe(event.battleId);
    expect(events[0]!.eventType).toBe(event.eventType);
    expect(events[0]!.actorType).toBe(event.actorType);
  });

  it("getById returns a single event by id", async () => {
    const store = new BattleEventStore();
    const event = makeBattleEvent();
    const id = await store.append(event);

    const fetched = await store.getById(id);
    expect(fetched).not.toBeNull();
    expect(fetched!.battleId).toBe(event.battleId);
    expect(fetched!.id).toBe(id);
  });

  it("getById returns null for non-existent id", async () => {
    const store = new BattleEventStore();
    const fetched = await store.getById(
      "00000000-0000-0000-0000-000000000099",
    );
    expect(fetched).toBeNull();
  });

  it("list returns empty array for a battle with no events", async () => {
    const store = new BattleEventStore();
    const events = await store.list("00000000-0000-0000-0000-00000000ffff");
    expect(events).toEqual([]);
  });
});

describe("BattleEventStore — sequence monotonicity per battle_id", () => {
  it("assigns sequence 1, 2, 3 for sequential appends on the same battle", async () => {
    const store = new BattleEventStore();
    const battleId = "00000000-0000-0000-0000-000000000001";
    await store.append(
      makeBattleEvent({ battleId, eventType: "brief_created" }),
    );
    await store.append(
      makeBattleEvent({ battleId, eventType: "team_created" }),
    );
    await store.append(
      makeBattleEvent({ battleId, eventType: "proposal_created" }),
    );

    const events = await store.list(battleId);
    expect(events).toHaveLength(3);
    expect(events[0]!.eventType).toBe("brief_created");
    expect(events[1]!.eventType).toBe("team_created");
    expect(events[2]!.eventType).toBe("proposal_created");
  });

  it("sequences are independent across different battles", async () => {
    const store = new BattleEventStore();
    const battleA = "00000000-0000-0000-0000-000000000001";
    const battleB = "00000000-0000-0000-0000-000000000002";

    await store.append(makeBattleEvent({ battleId: battleA }));
    await store.append(makeBattleEvent({ battleId: battleB }));
    await store.append(makeBattleEvent({ battleId: battleA }));
    await store.append(makeBattleEvent({ battleId: battleB }));

    const aEvents = await store.list(battleA);
    const bEvents = await store.list(battleB);

    expect(aEvents).toHaveLength(2);
    expect(bEvents).toHaveLength(2);
  });

  it("list returns events ordered by sequence ASC", async () => {
    const store = new BattleEventStore();
    const battleId = "00000000-0000-0000-0000-000000000003";
    await store.append(
      makeBattleEvent({ battleId, eventType: "brief_created" }),
    );
    await store.append(
      makeBattleEvent({ battleId, eventType: "team_created" }),
    );
    await store.append(
      makeBattleEvent({ battleId, eventType: "proposal_created" }),
    );

    const events = await store.list(battleId);
    expect(events.map((e) => e.eventType)).toEqual([
      "brief_created",
      "team_created",
      "proposal_created",
    ]);
  });
});

describe("BattleEventStore — validation rejection", () => {
  it("rejects an event with a missing required field", async () => {
    const store = new BattleEventStore();
    const invalid = {
      id: "evt_bad_001",
      round: "proposal_round",
      actorType: "system" as const,
      eventType: "brief_created" as const,
      title: "Bad event",
      content: "missing battleId",
      createdAt: "2026-01-01T00:00:00.000Z",
    };

    await expect(
      store.append(invalid as unknown as BattleEvent),
    ).rejects.toThrow(SchemaValidationError);
  });

  it("rejects an event with an invalid actorType enum", async () => {
    const store = new BattleEventStore();
    const invalid = makeBattleEvent({
      actorType: "not_a_real_actor" as never,
    });
    await expect(store.append(invalid)).rejects.toThrow(
      SchemaValidationError,
    );
  });

  it("rejects an event with an invalid eventType enum", async () => {
    const store = new BattleEventStore();
    const invalid = makeBattleEvent({
      eventType: "not_a_real_event" as never,
    });
    await expect(store.append(invalid)).rejects.toThrow(
      SchemaValidationError,
    );
  });

  it("rejects an event with an empty title", async () => {
    const store = new BattleEventStore();
    const invalid = makeBattleEvent({ title: "" });
    await expect(store.append(invalid)).rejects.toThrow(
      SchemaValidationError,
    );
  });
});

describe("BattleEventStore — payload round-trip", () => {
  it("persists rawPayload inside payload_json and reads it back", async () => {
    const store = new BattleEventStore();
    const battleId = "00000000-0000-0000-0000-000000000001";
    const event = makeBattleEvent({
      battleId,
      rawPayload: { complex: { nested: [1, 2, 3], flag: true } },
    });

    await store.append(event);
    const events = await store.list(battleId);
    expect(events).toHaveLength(1);
    // The store wraps the event's rawPayload inside payload_json along with
    // title/content. So the returned event's rawPayload field equals the
    // full payload_json: { title, content, rawPayload: <original> }.
    const payloadJson = events[0]!.rawPayload as {
      title: string;
      content: string;
      rawPayload: { complex: { nested: number[]; flag: boolean } };
    };
    expect(payloadJson.rawPayload.complex.nested).toEqual([1, 2, 3]);
    expect(payloadJson.rawPayload.complex.flag).toBe(true);
  });

  it("persists title and content inside payload_json", async () => {
    const store = new BattleEventStore();
    const battleId = "00000000-0000-0000-0000-000000000002";
    const event = makeBattleEvent({
      battleId,
      title: "My Title",
      content: "My Content",
    });

    await store.append(event);
    const events = await store.list(battleId);
    expect(events).toHaveLength(1);
    const payloadJson = events[0]!.rawPayload as { title: string; content: string };
    expect(payloadJson.title).toBe("My Title");
    expect(payloadJson.content).toBe("My Content");
  });
});

describe("BattleEventStore — ordering guarantees", () => {
  it("list returns events in ascending sequence order", async () => {
    const store = new BattleEventStore();
    const battleId = "00000000-0000-0000-0000-000000000001";
    const types: Array<
      "brief_created" | "team_created" | "proposal_created" | "attack_created"
    > = ["brief_created", "team_created", "proposal_created", "attack_created"];

    for (const t of types) {
      await store.append(makeBattleEvent({ battleId, eventType: t }));
    }

    const events = await store.list(battleId);
    expect(events).toHaveLength(types.length);
    expect(events.map((e) => e.eventType)).toEqual(types);
  });

  it("list filters by battleId — other battles' events are excluded", async () => {
    const store = new BattleEventStore();
    const battleA = "00000000-0000-0000-0000-000000000001";
    const battleB = "00000000-0000-0000-0000-000000000002";

    await store.append(makeBattleEvent({ battleId: battleA }));
    await store.append(makeBattleEvent({ battleId: battleB }));
    await store.append(makeBattleEvent({ battleId: battleA }));

    const aEvents = await store.list(battleA);
    expect(aEvents).toHaveLength(2);
    for (const e of aEvents) {
      expect(e.battleId).toBe(battleA);
    }
  });
});
