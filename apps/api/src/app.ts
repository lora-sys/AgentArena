import { Hono } from "hono";

export const app = new Hono();

app.get("/api/health", (context) =>
  context.json({ status: "ok", service: "agent-arena-api" }),
);

app.get("/api/battles/:id", (context) => {
  const battleId = context.req.param("id");
  return context.json({
    battle: {
      id: battleId,
      status: battleId === "demo" ? "completed" : "ready",
    },
  });
});
