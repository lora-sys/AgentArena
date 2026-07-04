import { buildDemoExportMarkdown } from "@/lib/export-markdown";

export function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return params.then(({ id }) => {
    const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "-");
    return new Response(buildDemoExportMarkdown(id), {
      headers: {
        "content-type": "text/markdown; charset=utf-8",
        "content-disposition": `attachment; filename="agent-arena-${safeId}-export.md"`
      }
    });
  });
}
