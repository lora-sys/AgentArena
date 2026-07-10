import { buildDemoExportMarkdown } from "@/lib/export-markdown";
import { withRateLimit, validateBattleId, badRequest } from "@/lib/api/guards";

async function exportHandler(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;

  if (!validateBattleId(id)) {
    return badRequest("Invalid battle ID format");
  }

  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "-");
  return new Response(buildDemoExportMarkdown(id), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": `attachment; filename="agent-arena-${safeId}-export.md"`,
    },
  });
}

export const GET = withRateLimit(exportHandler);
