import z from "zod";

export const createChatInputSchema = z.object({
  userPrompt: z.string(),
});

export const createChatOutputSchema = z.object({
  output: z.string().optional().describe("response of ai "),
});
