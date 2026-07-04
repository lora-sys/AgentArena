export type ArtifactType =
  | "product_brief"
  | "prd"
  | "architecture"
  | "demo_script"
  | "pitch_outline"
  | "todo";

export type Artifact = {
  id: string;
  battleId: string;
  type: ArtifactType;
  title: string;
  content: string;
};

export type ExportMarkdownInput = {
  battleId: string;
  artifacts: Artifact[];
};

export type MarkdownExport = {
  filename: string;
  content: string;
};

const artifactOrder: ArtifactType[] = [
  "product_brief",
  "prd",
  "architecture",
  "demo_script",
  "pitch_outline",
  "todo",
];

export function exportMarkdown(input: ExportMarkdownInput): MarkdownExport {
  const orderedArtifacts = [...input.artifacts].sort((left, right) => {
    return artifactOrder.indexOf(left.type) - artifactOrder.indexOf(right.type);
  });

  return {
    filename: `${input.battleId}-artifacts.md`,
    content: orderedArtifacts.map(formatArtifact).join("\n\n---\n\n"),
  };
}

export function missingArtifactTypes(artifacts: Artifact[]): ArtifactType[] {
  const presentTypes = new Set(artifacts.map((artifact) => artifact.type));
  return artifactOrder.filter((type) => !presentTypes.has(type));
}

function formatArtifact(artifact: Artifact): string {
  return [`# ${artifact.title}`, "", `Artifact type: ${artifact.type}`, "", artifact.content.trim()].join("\n");
}
