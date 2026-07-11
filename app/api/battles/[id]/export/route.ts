import { buildDemoExportMarkdown } from "@/lib/export-markdown";
import { findById as findBattleById } from "@/lib/db/repo/battle-repo";
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

  // Try to load the real battle from DB. If found, export the real battle's
  // title and idea (never lie about which data we are serving). If not found,
  // or if the DB is unavailable, fall back to the demo export so the route
  // still works in demo mode (PRD §8.3: ENABLE_EXAMPLE_BATTLES).
  try {
    const row = await findBattleById(id);
    if (row) {
      // R24 fix: sanitize DB-sourced content so injected `---` or
      // newlines in title/idea can't break the markdown structure.
      // Strip `---` sequences and collapse newlines in title; strip
      // newlines in idea to prevent breaking section boundaries.
      const safeTitle = (row.title ?? "").replace(/---/g, "—").replace(/[\r\n]+/g, " ");
      const safeIdea = (row.idea ?? "").replace(/[\r\n]+/g, " ");
      const realExport = `# ${safeTitle}: Agent Arena Export\n\nBattle ID: ${row.id}\nStatus: ${row.status}\n\n## Idea\n\n${safeIdea}\n\n## Battle Detail\n\n${buildDemoExportMarkdown(id).split("---\n\n").slice(1).join("---\n\n")}`;
      return new Response(realExport, {
        headers: {
          "content-type": "text/markdown; charset=utf-8",
          "content-disposition": `attachment; filename="agent-arena-${safeId}-export.md"`,
        },
      });
    }
  } catch (dbErr) {
    // DB unavailable — fall through to demo export below.
    console.warn(
      "[GET /api/battles/[id]/export] DB lookup failed, using demo export:",
      dbErr,
    );
  }

  // Battle not found in DB → demo export (demo data only).
  return new Response(buildDemoExportMarkdown(id), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": `attachment; filename="agent-arena-${safeId}-export.md"`,
    },
  });
}

export const GET = withRateLimit(exportHandler);
