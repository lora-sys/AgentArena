// Typed Postgres client for AgentArena v0.4.
//
// Two backends:
//   1. Neon serverless (drizzle-orm/neon-http + @neondatabase/serverless):
//      chosen for Vercel deploys. No persistent connection — works on
//      serverless and edge runtimes. Preferred when DATABASE_URL starts
//      with `postgres://` or `postgresql://` AND looks like a Neon URL.
//   2. node-postgres (drizzle-orm/node-postgres + pg):
//      for local dev, Docker, self-hosted Postgres, or non-Neon providers.
//
// The selection happens lazily inside getDb() so importing this module
// does not crash if DATABASE_URL is absent (useful for build time / tests).
//
// Pattern: callers always import `getDb` and call it per-request so the
// connection is re-evaluated when env vars change.

import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { Pool } from "pg";
import * as schema from "./schema";

// ---------------------------------------------------------------------------
// Backend detection
// ---------------------------------------------------------------------------

type Backend = "neon" | "node-postgres";

function detectBackend(url: string | undefined): Backend {
  if (!url) return "node-postgres";
  // Neon URLs: postgres://user:pass@ep-xxx.region.aws.neon.tech/db?sslmode=require
  // Also accepts .neon.tech hostnames regardless of region subdomain.
  try {
    const parsed = new URL(url);
    if (parsed.hostname.endsWith(".neon.tech")) return "neon";
    if (parsed.hostname.endsWith(".neon.build")) return "neon";
  } catch {
    // fall through to default
  }
  return "node-postgres";
}

// ---------------------------------------------------------------------------
// Cached clients
// ---------------------------------------------------------------------------

let cachedDb: ReturnType<typeof drizzleNeon<typeof schema>> | ReturnType<typeof drizzleNode<typeof schema>> | null = null;
let cachedBackend: Backend | null = null;
let cachedNeonClient: NeonQueryFunction<false, false> | null = null;
let cachedNodePool: Pool | null = null;

/**
 * Returns the typed Drizzle client. Lazily constructs (and caches) the
 * underlying Postgres connection on first call.
 *
 * Reads DATABASE_URL from process.env at call time so deploys that swap
 * env vars (Vercel preview vs prod) pick up the right driver automatically.
 *
 * Throws if DATABASE_URL is not set.
 */
export function getDb(): NonNullable<typeof cachedDb> {
  if (cachedDb) return cachedDb;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Configure it in .env.local or your deploy env.",
    );
  }

  const backend = detectBackend(url);
  cachedBackend = backend;

  if (backend === "neon") {
    cachedNeonClient = neon(url);
    cachedDb = drizzleNeon(cachedNeonClient, { schema });
  } else {
    cachedNodePool = new Pool({ connectionString: url });
    cachedDb = drizzleNode(cachedNodePool, { schema });
  }

  return cachedDb;
}

/**
 * Force-close any pooled connections. Use in scripts or tests that need
 * a clean shutdown (avoids hanging the process).
 */
export async function closeDb(): Promise<void> {
  if (cachedNodePool) {
    await cachedNodePool.end();
    cachedNodePool = null;
  }
  cachedNeonClient = null;
  cachedDb = null;
  cachedBackend = null;
}

/**
 * Reports which backend is active after getDb() has been called once.
 * Returns null if getDb() has not run yet.
 */
export function getActiveBackend(): Backend | null {
  return cachedBackend;
}

export { schema };
