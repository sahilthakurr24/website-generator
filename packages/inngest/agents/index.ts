
import { createAgent } from "@inngest/agent-kit";
import { gpt4oMiniModel } from "../model";
import { getSystemPrompt } from "../prompt";

export const websiteGenerator = createAgent({
  name: "Website-generator",
  system: getSystemPrompt(),
  model: gpt4oMiniModel,
});


