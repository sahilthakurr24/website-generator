/**
 * Normalizes file text from Bolt/XML or JSON so Monaco shows real line breaks.
 */
function stripMarkdownCodeFences(content: string): string {
  const trimmed = content.trim();
  const wrapped = trimmed.match(/^```(?:[\w-+.]*)\s*\r?\n([\s\S]*?)\r?\n```\s*$/);
  if (wrapped?.[1] !== undefined) {
    return dedentUniformBlock(wrapped[1]);
  }

  if (!trimmed.startsWith("```")) {
    return content;
  }

  const lines = trimmed.split("\n");
  if (!/^```[\w-+.]*\s*$/.test(lines[0] ?? "")) {
    return content;
  }

  lines.shift();
  if (lines.length && lines.at(-1)?.trim() === "```") {
    lines.pop();
  }

  return dedentUniformBlock(lines.join("\n"));
}

/** Removes one shared leading indent (common when code sits inside markdown lists). */
function dedentUniformBlock(content: string): string {
  const lines = content.split("\n");
  const indents = lines
    .filter((line) => line.trim().length > 0)
    .map((line) => line.match(/^(\s*)/)?.[1]?.length ?? 0);

  if (!indents.length) return content;

  const minIndent = Math.min(...indents);
  if (minIndent === 0) return content;

  return lines.map((line) => (line.trim().length === 0 ? line : line.slice(minIndent))).join("\n");
}

export function normalizeFileContent(content: string | null | undefined): string {
  if (!content) return "";

  let normalized = content.replace(/\r\n/g, "\n");
  normalized = stripMarkdownCodeFences(normalized);

  const literalEscapeCount = (normalized.match(/\\n/g) ?? []).length;
  const actualNewlineCount = (normalized.match(/\n/g) ?? []).length;

  if (literalEscapeCount > 0 && literalEscapeCount >= actualNewlineCount) {
    normalized = normalized
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\r/g, "\r");
  }

  return normalized.replace(/\n{3,}/g, "\n\n").trimEnd();
}

export function getEditorLanguage(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "ts":
    case "tsx":
      return "typescript";
    case "js":
    case "jsx":
    case "mjs":
    case "cjs":
      return "javascript";
    case "json":
      return "json";
    case "css":
      return "css";
    case "scss":
      return "scss";
    case "html":
    case "htm":
      return "html";
    case "md":
    case "markdown":
      return "markdown";
    case "yaml":
    case "yml":
      return "yaml";
    case "xml":
      return "xml";
    case "svg":
      return "xml";
    default:
      return "plaintext";
  }
}
