import { inngest } from "../client";
import { websiteGenerator } from "../agents";

export type InngestFn = ReturnType<typeof inngest.createFunction>;
const testFunction: InngestFn = inngest.createFunction(
  {
    id: "test-function",
    triggers: [{ event: "test-function" }],
  },
  async ({ event }) => {
    const result = await websiteGenerator.run(event.data.prompt);
    return result.output;
  },
);

export { testFunction };
