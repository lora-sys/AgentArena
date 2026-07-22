/**
 * In-memory battle store.
 *
 * The battle engine (`runDemoBattle`) runs synchronously and produces a
 * `CompletedBattleBundle`. To make the per-battle API routes
 * (`/api/battles/[id]/events`, `/events/stream`, `/status`) return
 * real per-battle data instead of always the hardcoded demo bundle,
 * we cache the bundle keyed by battle ID.
 *
 * For Sprint 2.5 demo: single-process in-memory. For Sprint 3:
 * persist to Postgres (lib/db/) via Drizzle.
 */

import type { CompletedBattleBundle } from "@/arena";

const bundles = new Map<string, CompletedBattleBundle>();

export function storeBundle(battleId: string, bundle: CompletedBattleBundle): void {
  bundles.set(battleId, bundle);
}

export function loadBundle(battleId: string): CompletedBattleBundle | undefined {
  return bundles.get(battleId);
}

export function hasBundle(battleId: string): boolean {
  return bundles.has(battleId);
}

export function listBundles(): CompletedBattleBundle[] {
  return Array.from(bundles.values());
}

export function clearBundles(): void {
  bundles.clear();
}
