import React, { useMemo } from "react";
import Editor from "@monaco-editor/react";
import { FileCode2 } from "lucide-react";
import { getEditorLanguage, normalizeFileContent } from "~/helper/file-content";
import { FileItem } from "../../types/step";

interface CodeEditorProps {
  file: FileItem | null;
}

export function CodeEditor({ file }: CodeEditorProps) {
  const language = useMemo(
    () => (file ? getEditorLanguage(file.name) : "plaintext"),
    [file],
  );

  const content = useMemo(
    () => (file ? normalizeFileContent(file.content) : ""),
    [file],
  );

  if (!file) {
    return (
      <div className="flex h-full min-h-[20rem] items-center justify-center rounded-md border border-dashed border-gray-700 bg-gray-950/50 text-sm text-gray-400">
        Select a file from the explorer to view its contents
      </div>
    );
  }

  const displayPath = file.path.replace(/^\//, "");

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-md border border-gray-700 bg-[#1e1e1e]">
      <div className="flex shrink-0 items-center gap-2 border-b border-gray-700 bg-gray-800/90 px-3 py-2">
        <FileCode2 className="h-4 w-4 shrink-0 text-blue-400" />
        <span className="truncate font-mono text-sm text-gray-200">{displayPath}</span>
        <span className="ml-auto rounded bg-gray-700/80 px-2 py-0.5 text-xs uppercase tracking-wide text-gray-400">
          {language}
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <Editor
          key={file.path}
          height="100%"
          language={language}
          theme="vs-dark"
          value={content}
          options={{
            readOnly: true,
            automaticLayout: true,
            minimap: { enabled: false },
            fontSize: 13,
            lineHeight: 20,
            fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, 'Courier New', monospace",
            fontLigatures: true,
            wordWrap: "off",
            scrollBeyondLastLine: false,
            padding: { top: 12, bottom: 12 },
            lineNumbers: "on",
            renderLineHighlight: "line",
            smoothScrolling: true,
            folding: true,
            bracketPairColorization: { enabled: true },
            scrollbar: {
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            },
            overviewRulerLanes: 0,
          }}
        />
      </div>
    </div>
  );
}
