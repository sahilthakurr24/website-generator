import { inngest } from "../client";
import { websiteGenerator } from "../agents/websiteGenerator";

export type InngestFn = ReturnType<typeof inngest.createFunction>;
const testFunction: InngestFn = inngest.createFunction(
  {
    id: "website-generate-01",
    triggers: [{ event: "website-generate" }],
  },
  async ({ event }) => {
    const { createBasePrompt } = event.data;

    const websiteGeneratorResponse = await websiteGenerator.run(`
      Context:
      
      ${createBasePrompt.prompt.join("\n\n")}
      
      ${createBasePrompt.uiPrompt.join("\n\n")}
      
      User request:
      ${event.data.prompt}
      `);
    return {
      message: "Response has been generated!!",
      data: websiteGeneratorResponse.output,
      success: true,
    };
  },
);

export { testFunction };
