import { serve } from "@hono/node-server";
import { existsSync } from "node:fs";
import path from "node:path";

const envCandidates: string[] = [];
let envDirectory = path.resolve(".");
while (true) {
  envCandidates.push(path.join(envDirectory, ".env.local"));
  const parent = path.dirname(envDirectory);
  if (parent === envDirectory) break;
  envDirectory = parent;
}

for (const candidate of envCandidates) {
  if (existsSync(candidate)) {
    process.loadEnvFile(candidate);
    break;
  }
}

const { app } = await import("./app");

serve({ fetch: app.fetch, port: 8787 }, (info) => {
  console.log(`Agent Arena API listening on http://localhost:${info.port}`);
});
