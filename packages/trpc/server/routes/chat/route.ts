import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { createChatInputSchema, createChatOutputSchema } from "./model";
import { BASE_PROMPT, nodeBasePrompt, reactBasePrompt, inngestClient } from "@repo/inngest";
import type { Message } from "@repo/inngest";
import { templateGenerator } from "@repo/inngest/template-generator";

interface CreateBasePromptType {
  prompt: Array<string>;
  uiPrompt: Array<string>;
  success: boolean;
}

const TAGS = ["CHAT"];
const getPath = generatePath("chat");

export const chatRouter = router({
  createChat: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/create-chat"), tags: TAGS } })
    .input(createChatInputSchema)
    .output(createChatOutputSchema)
    .mutation(async ({ input }) => {
      const { prompt } = input;
      //creete the template first;
      const res1 = await templateGenerator.run(prompt);
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

      //send inngest data
      await inngestClient.send({
        name: "website-generate",
        data: { createBasePrompt, prompt },
      });

      return createBasePrompt;
    }),
});
