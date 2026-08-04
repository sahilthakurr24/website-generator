import z from "zod";

export const getTemplateInputSchema = z.object({
  userPrompt: z.string().describe("User prompt"),
});

export const getTemplateOutputSchema = z.object({
  prompt: z.array(z.string()).describe("Prompt for llm model"),
  uiPrompt: z.array(z.string()).describe("Ui prompt for the llm model"),
  userPrompt : z.string(),
  success : z.boolean(),
});
