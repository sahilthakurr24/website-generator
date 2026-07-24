import { inngest } from "../client";
import { createAgent } from "@inngest/agent-kit";
import { gpt4oMiniModel } from "../model";

export const templateGenerator = createAgent({
  name: "template-generator",
  model: gpt4oMiniModel,
  system:
    "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra",
});
