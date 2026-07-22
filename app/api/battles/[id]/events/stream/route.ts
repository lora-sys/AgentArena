import { loadBundle, hasBundle } from "@/lib/battle-store";
import { getDemoBundle } from "@/lib/demo-data";
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

  // Demo shortcut — never 500 on a valid battle ID.
  if (id === "demo") {
    try {
      const bundle = getDemoBundle();
      return streamFromEvents(id, bundle.events);
    } catch (err) {
      console.error(`[stream] demo bundle failed for ${id}:`, err);
      return streamFromEvents(id, []);
    }
  }

  // Real battle — return empty stream if not found.
  if (!hasBundle(id)) {
    return streamFromEvents(id, []);
  }

  const bundle = loadBundle(id);
  if (!bundle) return streamFromEvents(id, []);
  return streamFromEvents(id, bundle.events);
}

function streamFromEvents(battleId: string, events: ReadonlyArray<{ id: string; eventType: string; [key: string]: unknown }>): Response {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  for (const event of events) {
    const chunk = `event: ${event.eventType}\ndata: ${JSON.stringify({ ...event, battleId })}\n\n`;
    chunks.push(encoder.encode(chunk));
  }

  let index = 0;
  const stream = new ReadableStream({
    pull(controller) {
      if (index < chunks.length) {
        controller.enqueue(chunks[index]);
        index += 1;
      } else {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
  });
}

export const GET = withRateLimit(streamHandler);
