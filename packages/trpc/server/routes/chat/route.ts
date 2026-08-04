import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { createChatInputSchema, createChatOutputSchema } from "./model";

import { agentService } from "../../services";
import { TRPCError } from "@trpc/server";

const TAGS = ["CHAT"];
const getPath = generatePath("chat");

export const chatRouter = router({
  createChat: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/create-chat"), tags: TAGS } })
    .input(createChatInputSchema)
    .output(createChatOutputSchema)
    .mutation(async ({ input }) => {
      const { prompt, uiPrompt, success, userPrompt } = input;

      const createBasePrompt = { prompt, uiPrompt, success, userPrompt };
      const { response } = await agentService.getWebsiteGeneratorResponse({ createBasePrompt });
      if (!response)
        throw new TRPCError({
          message: "Unable to generate the response",
          code: "INTERNAL_SERVER_ERROR",
        });

     return  {response};
    }),
});
