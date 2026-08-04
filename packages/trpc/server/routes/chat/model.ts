import z from "zod";

export const createChatInputSchema = z.object({
  prompt: z.array(z.string()).describe("Prompt for llm model"),
  uiPrompt: z.array(z.string()).describe("Ui prompt for the llm model"),
  userPrompt: z.string(),
  success: z.boolean(),
});

export const createChatOutputSchema = z.object({
  response: z.string().describe("response of ai "),
});
