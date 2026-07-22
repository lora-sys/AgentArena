import { describe, expect, it } from "vitest";
import { app } from "./app";

describe("API shell", () => {
  it("reports health without Next.js", async () => {
    const response = await app.request("/api/health");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ status: "ok" });
  });
});
