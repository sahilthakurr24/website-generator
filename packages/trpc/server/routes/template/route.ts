import { agentService } from "../../services";
import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { getTemplateInputSchema, getTemplateOutputSchema } from "./model";

const TAGS = ["TEMPLATE"];
const getPath = generatePath("template");

export const templateRouter = router({
  getTemplate: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("get-template"), tags: TAGS } })
    .input(getTemplateInputSchema)
    .output(getTemplateOutputSchema)
    .mutation(async ({ input }) => {
      const { userPrompt } = input;
      const { createBasePrompt } = await agentService.getTemplate({ userPrompt });

      return {
        prompt: createBasePrompt?.prompt,
        uiPrompt: createBasePrompt?.uiPrompt,
        userPrompt: createBasePrompt?.userPrompt,
        success: createBasePrompt?.success,
      };
    }),
});
