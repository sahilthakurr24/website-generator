import { Agent } from "@openai/agents";
import { getSystemPrompt } from "../prompt";

export const websiteGeneratorAgent = new Agent({
  name: "WebsiteGenerator Agent",
  instructions: getSystemPrompt(),
  model: "gpt-4o-mini",
});
