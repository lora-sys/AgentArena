import { runBattleFromPayload } from "@/lib/battle-api";
import { withRateLimit, validateBattleId, badRequest } from "@/lib/api/guards";

type BattleEventStreamRouteContext = {
  params: Promise<{ id: string }>;
};

async function streamHandler(
  _request: Request,
  { params }: BattleEventStreamRouteContext,
): Promise<Response> {
  const { id } = await params;

  if (id !== "demo" && !validateBattleId(id)) {
    return badRequest("Invalid battle ID format");
  }

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

export const GET = withRateLimit(streamHandler);
