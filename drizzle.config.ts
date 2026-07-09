import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    // drizzle-kit reads DATABASE_URL via dotenv convention; use the env var.
    // For local docker:  postgresql://arena:arena@localhost:5432/arena
    // For Neon serverless: postgres://user:pass@ep-xxx.region.aws.neon.tech/db?sslmode=require
    url: process.env.DATABASE_URL ?? "postgresql://arena:arena@localhost:5432/arena",
  },
  strict: true,
  verbose: true,
});
