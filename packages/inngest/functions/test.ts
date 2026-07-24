import { inngest } from "../client";
import { websiteGenerator } from "../agents/websiteGenerator";
import { templateGenerator } from "../agents/templateGenerator";
import { Message, TextMessage } from "@inngest/agent-kit";
import { basePrompt as nodeBasePrompt } from "../template/node";
import { basePrompt as reactBasePrompt } from "../template/react";
import { BASE_PROMPT } from "../prompt";

interface CreateBasePromptType {
  prompt: Array<string>;
  uiPrompt: Array<string>;
  success: boolean;
}

export type InngestFn = ReturnType<typeof inngest.createFunction>;
const testFunction: InngestFn = inngest.createFunction(
  {
    id: "test-function",
    triggers: [{ event: "test-function" }],
  },
  async ({ event, step }) => {
    const res1 = await templateGenerator.run(event.data.prompt, { step });
    // return res1.output;
    const result: Message[] = res1.output;
    let answer = "";

    if (result[0]?.type === "text") {
      if (typeof result[0].content === "string") answer = result[0].content;
    }

    let createBasePrompt: CreateBasePromptType = { prompt: [], uiPrompt: [], success: false };

    if (answer === "react") {
      createBasePrompt.prompt = [
        BASE_PROMPT,
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lo.ck.json\n`,
      ];
      createBasePrompt.uiPrompt = [reactBasePrompt];
      createBasePrompt.success = true;
    } else if (answer === "node") {
      createBasePrompt.prompt = [
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ];
      createBasePrompt.uiPrompt = [nodeBasePrompt];
      createBasePrompt.success = true;
    }

    if (createBasePrompt.success === false) {
      return "Something went wrong while creating the base prompt";
    }

    const websiteGeneratorResponse = await websiteGenerator.run(`
      Context:
      
      ${createBasePrompt.prompt.join("\n\n")}
      
      ${createBasePrompt.uiPrompt.join("\n\n")}
      
      User request:
      ${event.data.prompt}
      `);
    return websiteGeneratorResponse.output;
  },
);

export { testFunction };
