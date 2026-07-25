import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { BattleEvent } from "@agent-arena/contracts";
import { assertBattleEvent } from "@/arena/schemas/validators";

export type LiveBattleStatus = "created" | "running" | "completed" | "failed";

export type StoredLiveBattle = {
  battleId: string;
  idea: string;
  status: LiveBattleStatus;
  events: BattleEvent[];
  createdAt: string;
  updatedAt: string;
  error?: string;
};

export function resolveLiveBattleRoot(env: NodeJS.ProcessEnv = process.env, moduleUrl = import.meta.url): string {
  if (env.VITEST) return path.join(tmpdir(), `agent-arena-live-${process.pid}`);
  if (env.AGENT_ARENA_DATA_DIR) return path.resolve(env.AGENT_ARENA_DATA_DIR);
  return fileURLToPath(new URL("../.data/live-battles/", moduleUrl));
}

export class LocalLiveBattleStore {
  private readonly root: string;
  private readonly queues = new Map<string, Promise<void>>();

  constructor(root = resolveLiveBattleRoot()) { this.root = root; }

  async create(battleId: string, idea: string): Promise<StoredLiveBattle> {
    const at = new Date().toISOString();
    const battle: StoredLiveBattle = { battleId, idea, status: "created", events: [], createdAt: at, updatedAt: at };
    await this.write(battle);
    return battle;
  }

  async get(battleId: string): Promise<StoredLiveBattle | null> {
    try {
      return JSON.parse(await readFile(this.fileFor(battleId), "utf8")) as StoredLiveBattle;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw error;
    }
  }

  async append(battleId: string, event: BattleEvent): Promise<void> {
    const validatedEvent = {
      ...event,
      actorType: event.actorId ? (event.actorId === "judge_panel" ? "judge" : "agent") : "system",
    } as BattleEvent;
    assertBattleEvent(validatedEvent);
    await this.serial(battleId, async () => {
      const battle = await this.get(battleId);
      if (!battle) throw new Error(`找不到本地战斗 ${battleId}`);
      if (battle.events.some((candidate) => candidate.id === event.id)) return;
      battle.events.push({ ...validatedEvent, sequence: battle.events.length + 1 });
      battle.status = "running";
      battle.updatedAt = new Date().toISOString();
      await this.write(battle);
    });
  }

  async finish(battleId: string, status: "completed" | "failed", error?: string): Promise<void> {
    await this.serial(battleId, async () => {
      const battle = await this.get(battleId);
      if (!battle) return;
      battle.status = status;
      battle.error = error;
      battle.updatedAt = new Date().toISOString();
      await this.write(battle);
    });
  }

  private fileFor(battleId: string): string {
    return path.join(this.root, `${battleId.replace(/[^a-zA-Z0-9_-]/g, "_")}.json`);
  }

  private async write(battle: StoredLiveBattle): Promise<void> {
    await mkdir(this.root, { recursive: true });
    const target = this.fileFor(battle.battleId);
    const temporary = `${target}.${process.pid}.tmp`;
    await writeFile(temporary, JSON.stringify(battle, null, 2), "utf8");
    await rename(temporary, target);
  }

  private async serial(battleId: string, operation: () => Promise<void>): Promise<void> {
    const previous = this.queues.get(battleId) ?? Promise.resolve();
    const current = previous.then(operation, operation);
    this.queues.set(battleId, current);
    try { await current; } finally {
      if (this.queues.get(battleId) === current) this.queues.delete(battleId);
    }
  }
}
