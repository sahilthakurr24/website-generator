import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { createChatInputSchema, createChatOutputSchema } from "./model";



import { agentService } from "../../services";

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
      const { userPrompt } = input;
      // getting the template
      const { createBasePrompt } = await agentService.getTemplate({ userPrompt });
      const { response } = await agentService.getWebsiteGeneratorResponse({ createBasePrompt });
      console.log(response);
      return { output: response };
    }),
});
