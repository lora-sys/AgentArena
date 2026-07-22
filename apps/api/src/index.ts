import { serve } from "@hono/node-server";
import { app } from "./app";

serve({ fetch: app.fetch, port: 8787 }, (info) => {
  console.log(`Agent Arena API listening on http://localhost:${info.port}`);
});
