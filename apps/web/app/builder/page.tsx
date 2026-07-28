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
import { useRealtime } from "@repo/inngest/react";
import { getRealtimeToken } from "~/app/actions/getRealTimeToken";
import {
  findFileByPath,
  getStreamingFileUpdates,
  updateFilesFromStream,
} from "~/helper/streaming-files";

type AgentStreamChunk = {
  event?: string;
  sequenceNumber?: number;
  data?: {
    delta?: unknown;
  };
};

type StreamMessageData = {
  event: "text.delta";

  content: string;
  path: string;
};
function Builder() {
  const searchParams = useSearchParams();
  const prompt = searchParams.get("prompt") ?? "";
  const [userPrompt, setUserPrompt] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [templateSet, setTemplateSet] = useState(false);
  const { createChatAsync, isError, isPending, isSuccess, status } = useChat();

  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [generationId] = useState(() => crypto.randomUUID());
  const [currFile, setCurrFile] = useState<FileItem | null>(null);

  const [steps, setSteps] = useState<Step[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const seenFilePaths = useRef(new Set<string>());
  const { messages, connectionStatus } = useRealtime({
    channel: `user:1:generation:${generationId}`,
    topics: ["agent_stream"],
    token: async () => await getRealtimeToken("1", generationId),
  });

  // const { streamedResponse, lastAgentEvent } = useMemo(() => {
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

  useEffect(() => {
    let originalFiles = [...files];
    let updateHappened = false;
    steps
      .filter(({ status }) => status === "pending")
      .map((step) => {
        updateHappened = true;
        if (step?.type === StepType.CreateFile) {
          let parsedPath = step.path?.split("/") ?? []; // ["src", "components", "App.tsx"]
          let currentFileStructure = [...originalFiles]; // {}
          let finalAnswerRef = currentFileStructure;

          let currentFolder = "";
          while (parsedPath.length) {
            currentFolder = `${currentFolder}/${parsedPath[0]}`;
            let currentFolderName = parsedPath[0];
            parsedPath = parsedPath.slice(1);

            if (!parsedPath.length) {
              // final file
              let file = currentFileStructure.find((x) => x.path === currentFolder);
              if (!file) {
                currentFileStructure.push({
                  name: currentFolderName!,
                  type: "file",
                  path: currentFolder,
                  content: step.code!,
                });
              } else {
                file.content = step.code!;
              }
            } else {
              /// in a folder
              let folder = currentFileStructure.find((x) => x.path === currentFolder);
              if (!folder) {
                // create the folder
                currentFileStructure.push({
                  name: currentFolderName!,
                  type: "folder",
                  path: currentFolder,
                  children: [],
                });
              }

              currentFileStructure = currentFileStructure.find(
                (x) => x.path === currentFolder,
              )!.children!;
            }
          }
          originalFiles = finalAnswerRef;
        }
      });

    if (updateHappened) {
      setFiles(originalFiles);
      setSteps((steps) =>
        steps.map((s: Step) => {
          return {
            ...s,
            status: "completed",
          };
        }),
      );
    }
  }, [steps, files]);

  async function init() {
    if (!prompt.trim()) return;
    setLoading(true);

    const { uiPrompt } = await createChatAsync({
      generationId,
      prompt: prompt.trim(),
    });

    setTemplateSet(true);
    const parsedSteps = parseXml(uiPrompt[0]).map((step: Step) => ({
      ...step,
      status: "pending",
    }));
    // getting the steps
    setSteps(
      parseXml(uiPrompt[0]).map((step: Step) => ({
        ...step,
        status: "pending",
      })),
    );

    setLoading(false);
  }

  // useEffect(() => {
  //  messages.all.forEach((message) => {
  //     const data = message.data as StreamMessageData;
  //     if (data && data.event === "text.delta") {
  //       console.log("data:", data.content);
  //       console.log("data",message);
  //       setSteps((prev) => [...prev, ...parseXml(data.content)]);
  //     }
  //   });

  // }, [messages.all]);

  useEffect(() => {
    const currentFile = findFileByPath(files, selectedFilePath);

    if (!currentFile) return;

    setCurrFile(currentFile);
  }, [files, selectedFilePath]);

  useEffect(() => {
    init();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-100">Website Builder</h1>
        <p className="text-sm text-gray-400 mt-1">Prompt: {prompt}</p>
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
            <div className="h-[calc(100%-4rem)]">
              {activeTab === "code" ? (
                <CodeEditor file={currFile} />
              ) : (
                // <PreviewFrame webContainer={webcontainer} files={files} />
                <div>todo</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Builder;
