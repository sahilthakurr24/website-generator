import z from "zod";

export const getTemplateSchema = z.object({
  userPrompt: z.string().describe("Prompt of the user"),
});

export type GetTemplateSchemaType = z.infer<typeof getTemplateSchema>;

const createBasePrompt = z.object({
  prompt: z.array(z.string()).describe("prompt for the product"),
  uiPrompt: z.array(z.string()).describe("prompt for the ui"),
  success: z.boolean().describe("tell if we are able to get the baseprompt or not "),
  userPrompt: z.string().describe("user prompt"),
});
export const getWebsiteGeneratorResponseSchema = z.object({
  createBasePrompt,
});

export type GetWebsiteGeneratorResponseSchemaType = z.infer<typeof getWebsiteGeneratorResponseSchema>