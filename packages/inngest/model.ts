import { openai , anthropic} from "@inngest/agent-kit";
import { env } from "./env";

export const WEBSITE_GENERATOR_MODE_OPENAI = "gpt-4o-mini";

export const gpt4oMiniModel: ReturnType<typeof openai> = openai({
  model: WEBSITE_GENERATOR_MODE_OPENAI,
  apiKey: env.OPENAI_API_KEY,
});
