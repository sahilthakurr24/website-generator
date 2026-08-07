"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { StepsList } from "~/components/ui/step-list";
import { Loader } from "~/components/ui/loader";
import { parseXml } from "~/helper/parser";
import { Step, FileItem, StepType } from "../../types/step";
import { useChat } from "../../hooks/api/chat";
import { useSearchParams } from "next/navigation";
import { FileExplorer } from "~/components/ui/file-explorer";
import { TabView } from "~/components/ui/tab-view";
import { CodeEditor } from "~/components/ui/code-editor";
import { findFileByPath, findFirstFile, updateFilesFromStream } from "~/helper/streaming-files";
import { normalizeFileContent } from "~/helper/file-content";
import { useTemplate } from "~/hooks/api/template";
import { useWebcontainer } from "~/hooks/usewebcontainer";
import { PreviewFrame } from "~/components/ui/preview-frame";

type WebContainerFile = {
  file: {
    contents: string;
  };
};

type WebContainerDirectory = {
  directory: WebContainerFiles;
};

type WebContainerFiles = {
  [name: string]: WebContainerFile | WebContainerDirectory;
};

function Builder() {
  const searchParams = useSearchParams();
  const uPrompt = searchParams.get("prompt") ?? "";

  const [userPrompt, setUserPrompt] = useState<string>("");
  const { webContainer } = useWebcontainer();

  const [loading, setLoading] = useState(false);
  const [templateSet, setTemplateSet] = useState(false);
  const { createChatAsync, isError, isPending, isSuccess, status } = useChat();
  const {
    getTemplateAsync,
    isError: tempError,
    isPending: tempIsPending,
    isSuccess: tempIsSuccess,
    status: tempSatus,
  } = useTemplate();

  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [generationId] = useState(() => crypto.randomUUID());

  const [steps, setSteps] = useState<Step[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const seenFilePaths = useRef(new Set<string>());

  //   const chunksBySequence = new Map<number, AgentStreamChunk>();

  //   for (const message of messages.all) {
  //     if (message.kind !== "data" || message.topic !== "agent_stream") continue;
  //     const chunk = message.data as AgentStreamChunk;
  //     if (typeof chunk.sequenceNumber === "number") {
  //       chunksBySequence.set(chunk.sequenceNumber, chunk);
  //     }
  //   }

  //   const chunks = [...chunksBySequence.entries()]
  //     .sort(([left], [right]) => left - right)
  //     .map(([, chunk]) => chunk);

  //   return {
  //     streamedResponse: chunks
  //       .filter((chunk) => chunk.event === "text.delta")
  //       .map((chunk) => chunk.data?.delta)
  //       .filter((delta): delta is string => typeof delta === "string")
  //       .join(""),
  //     lastAgentEvent: chunks.at(-1)?.event,
  //   };
  // }, [messages.all]);

  // useEffect(() => {
  //   const updates = getStreamingFileUpdates(streamedResponse);
  //   if (!updates.length) return;

  //   const firstNewFile = updates.find(
  //     (update) => !seenFilePaths.current.has(update.path),
  //   );
  //   for (const update of updates) seenFilePaths.current.add(update.path);

  //   setFiles((currentFiles) => updateFilesFromStream(currentFiles, updates));
  //   if (firstNewFile) setSelectedFilePath(`/${firstNewFile.path.replace(/^\//, "")}`);
  // }, [streamedResponse]);

  // useEffect(() => {
  //   if (lastAgentEvent !== "run.completed") return;

  //   setSteps(
  //     parseXml(streamedResponse).map((step) => ({
  //       ...step,
  //       status: "completed" as const,
  //     })),
  //   );
  // }, [lastAgentEvent, streamedResponse]);

  // const selectedFile = useMemo(
  //   () => findFileByPath(files, selectedFilePath),
  //   [files, selectedFilePath],
  // );

  const selectedFile = useMemo(
    () => findFileByPath(files, selectedFilePath),
    [files, selectedFilePath],
  );

  useEffect(() => {
    const pendingSteps = steps.filter((step) => step.status === "pending");
    if (!pendingSteps.length) return;

    const fileUpdates = pendingSteps
      .filter((step) => step.type === StepType.CreateFile && step.path)
      .map((step) => ({
        path: step.path!.replace(/^\//, ""),
        content: normalizeFileContent(step.code ?? ""),
        isComplete: true,
      }));

    if (fileUpdates.length) {
      setFiles((current) => updateFilesFromStream(current, fileUpdates));
    }

    setSteps((current) =>
      current.map((step) =>
        step.status === "pending" ? { ...step, status: "completed" as const } : step,
      ),
    );
  }, [steps]);

  async function init() {
    if (!uPrompt.trim()) return;
    setTemplateSet(true);

    const {
      prompt,
      uiPrompt,
      success,
      userPrompt: initialUserPrompt,
    } = await getTemplateAsync({ userPrompt: uPrompt.trim() });

    setTemplateSet(true);

    // getting the steps
    setSteps(
      parseXml(uiPrompt[0])?.map((step: Step) => {
        return { ...step, status: "pending" };
      }),
    );

    setLoading(true);

    const result = await createChatAsync({
      userPrompt: initialUserPrompt,
      uiPrompt,
      prompt,
      success,
    });

    setSteps((s) => {
      const nextId = s.reduce((max, step) => Math.max(max, step.id), 0) + 1;
      return [
        ...s,
        ...parseXml(result.response, nextId).map((step) => ({
          ...step,
          status: "pending" as const,
        })),
      ];
    });

    setLoading(false);
  }

  //create a anew useeffect which renders the files into the webcontainer

  useEffect(() => {
    function createMountStructure(files: FileItem[]): WebContainerFiles {
      const mountStructure: WebContainerFiles = {};

      for (const file of files) {
        if (file.type === "file") {
          mountStructure[file.name] = {
            file: {
              contents: file.content ?? "",
            },
          };
        } else {
          mountStructure[file.name] = {
            directory: createMountStructure(file.children ?? []),
          };
        }
      }

      return mountStructure;
    }
    const mountStructure = createMountStructure(files);
    console.log("mountStrucutre:", mountStructure);

    webContainer?.mount(mountStructure);
  }, [files, webContainer]);

  useEffect(() => {
    if (selectedFilePath) return;
    const firstFile = findFirstFile(files);
    if (firstFile) setSelectedFilePath(firstFile.path);
  }, [files, selectedFilePath]);

  useEffect(() => {
    init();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-100">Website Builder</h1>
        <p className="text-sm text-gray-400 mt-1">Prompt: {uPrompt}</p>
      </header>

      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-4 gap-6 p-6">
          <div className="col-span-1 space-y-6 overflow-auto">
            <div>
              <div className="max-h-[75vh] overflow-scroll">
                <StepsList steps={steps} currentStep={currentStep} onStepClick={setCurrentStep} />
              </div>

              <div>
                <div className="flex">
                  <br />
                  {(loading || !templateSet) && <Loader />}
                  {!(loading || !templateSet) && (
                    <div className="flex">
                      <textarea
                        value={userPrompt}
                        onChange={(e) => {
                          setUserPrompt(e.target.value);
                        }}
                        className="p-2 w-full"
                      ></textarea>
                      {/* <button
                        onClick={async () => {
                          const newMessage = {
                            role: "user" as "user",
                            content: userPrompt,
                          };

                          setLoading(true);
                          const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
                            messages: [...llmMessages, newMessage],
                          });
                          setLoading(false);

                          setLlmMessages((x) => [...x, newMessage]);
                          setLlmMessages((x) => [
                            ...x,
                            {
                              role: "assistant",
                              content: stepsResponse.data.response,
                            },
                          ]);

                          setSteps((s) => [
                            ...s,
                            ...parseXml(stepsResponse.data.response).map((x) => ({
                              ...x,
                              status: "pending" as "pending",
                            })),
                          ]);
                        }}
                        className="bg-purple-400 px-4"
                      >
                        Send
                      </button> */}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-1">
            <FileExplorer files={files} onFileSelect={(file) => setSelectedFilePath(file.path)} />
          </div>
          <div className="col-span-2 bg-gray-900 rounded-lg shadow-lg p-4 h-[calc(100vh-8rem)]">
            <TabView activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="flex h-[calc(100%-3rem)] min-h-0 flex-col">
              {activeTab === "code" ? (
                <CodeEditor file={selectedFile} />
              ) : (
                <PreviewFrame webContainer={webContainer} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Builder;
