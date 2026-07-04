import { runBattleFromPayload } from "@/lib/battle-api";

type BattleEventStreamRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: BattleEventStreamRouteContext) {
  const { id } = await params;
  const bundle = runBattleFromPayload({}, id);
  const body = bundle.events
    .map((event) => `event: ${event.eventType}\ndata: ${JSON.stringify(event)}\n`)
    .join("\n");

  return new Response(body, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
  });
}
