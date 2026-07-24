import z, { string } from "zod";

export const createChatInputSchema = z.object({
  prompt: z.string(),
});

export const createChatOutputSchema = z.object({
  prompt: z.array(z.string()),
  uiPrompt: z.array(z.string()),
  success: z.boolean().default(false)
});
