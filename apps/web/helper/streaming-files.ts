import type { FileItem } from "~/types/step";

export type StreamingFileUpdate = {
  content: string;
  isComplete: boolean;
  path: string;
};

/**
 * Extracts complete and in-progress file actions from a partial Bolt XML response.
 * The content is intentionally not trimmed: leading/trailing whitespace is code.
 */
export function getStreamingFileUpdates(source: string): StreamingFileUpdate[] {
  const updates: StreamingFileUpdate[] = [];
  const actionStart = /<boltAction\b([^>]*)>/g;

  let match: RegExpExecArray | null;
  while ((match = actionStart.exec(source)) !== null) {
    const attributes = match[1] ?? "";
    const type = /\btype="([^"]+)"/.exec(attributes)?.[1];
    const path = /\bfilePath="([^"]+)"/.exec(attributes)?.[1];

    if (type !== "file" || !path) continue;

    const contentStart = actionStart.lastIndex;
    const closingIndex = source.indexOf("</boltAction>", contentStart);
    updates.push({
      content:
        closingIndex === -1
          ? source.slice(contentStart)
          : source.slice(contentStart, closingIndex),
      isComplete: closingIndex !== -1,
      path,
    });
  }

  return updates;
}

export function updateFilesFromStream(
  files: FileItem[],
  updates: StreamingFileUpdate[],
): FileItem[] {
  const nextFiles = structuredClone(files) as FileItem[];

  for (const update of updates) {
    const pathParts = update.path.split("/").filter(Boolean);
    if (!pathParts.length) continue;

    let currentLevel = nextFiles;
    let currentPath = "";

    for (const [index, name] of pathParts.entries()) {
      currentPath = `${currentPath}/${name}`;
      const isFile = index === pathParts.length - 1;
      let node = currentLevel.find((item) => item.path === currentPath);

      if (!node) {
        node = {
          children: isFile ? undefined : [],
          name,
          path: currentPath,
          type: isFile ? "file" : "folder",
        };
        currentLevel.push(node);
      }

      if (isFile) {
        node.content = update.content;
      } else {
        node.children ??= [];
        currentLevel = node.children;
      }
    }
  }

  return nextFiles;
}

export function findFileByPath(
  files: FileItem[],
  path: string | null,
): FileItem | null {
  if (!path) return null;

  for (const item of files) {
    if (item.path === path && item.type === "file") return item;
    const match = findFileByPath(item.children ?? [], path);
    if (match) return match;
  }

  return null;
}

export function findFirstFile(files: FileItem[]): FileItem | null {
  for (const item of files) {
    if (item.type === "file") return item;
    const nested = findFirstFile(item.children ?? []);
    if (nested) return nested;
  }

  return null;
}
