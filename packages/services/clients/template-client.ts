import { Agent } from "@openai/agents";

export const templateAgent = new Agent({
  name: "Template Agent",
  instructions:
    "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra",
  model: "gpt-4o-mini",
});
