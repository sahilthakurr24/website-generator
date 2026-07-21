/// <reference types="node" />
import z from "zod";
import "dotenv/config";

const envSchema = z.object({
  OPENAI_API_KEY: z.string().describe("OpenAi api key"),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);
  return safeParseResult.data;
}

export const env = createEnv(process.env);
