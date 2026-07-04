import { buildDemoExportMarkdown } from "@/lib/export-markdown";

export function GET() {
  return new Response(buildDemoExportMarkdown(), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": 'attachment; filename="agent-arena-demo-export.md"'
    }
  });
}
