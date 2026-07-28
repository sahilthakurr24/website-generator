import { run } from "@openai/agents";
import {
  getTemplateSchema,
  GetTemplateSchemaType,
  getWebsiteGeneratorResponseSchema,
  GetWebsiteGeneratorResponseSchemaType,
} from "./model";
import { templateAgent } from "../clients/template-client";
import { basePrompt as nodeBasePrompt } from "../template/node";
import { basePrompt as reactBasePrompt } from "../template/react";
import { BASE_PROMPT } from "../prompt";
import { websiteGeneratorAgent } from "../clients/websiteGenerator-client";

interface CreateBasePromptType {
  prompt: Array<string>;
  uiPrompt: Array<string>;
  userPrompt: string;
  success: boolean;
}

class AgentService {
  public async getTemplate(payload: GetTemplateSchemaType) {
    const { userPrompt } = await getTemplateSchema.parseAsync(payload);

    const response = await run(templateAgent, userPrompt);

    const answer = response.finalOutput;

    let createBasePrompt: CreateBasePromptType = {
      prompt: [],
      uiPrompt: [],
      userPrompt,
      success: false,
    };
    if (answer === "react") {
      createBasePrompt.prompt = [
        BASE_PROMPT,
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lo.ck.json\n`,
      ];
      createBasePrompt.uiPrompt = [reactBasePrompt];
      createBasePrompt.success = true;
    } else if (answer === "node") {
      createBasePrompt.prompt = [
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ];
      createBasePrompt.uiPrompt = [nodeBasePrompt];
      createBasePrompt.success = true;
    }

    return { createBasePrompt };
  }

  public async getWebsiteGeneratorResponse(payload: GetWebsiteGeneratorResponseSchemaType) {
    const { createBasePrompt } = await getWebsiteGeneratorResponseSchema.parseAsync(payload);

    const res = await run(
      websiteGeneratorAgent,
      `Context:

      ${createBasePrompt.prompt.join("\n\n")}

      ${createBasePrompt.uiPrompt.join("\n\n")}

      User request:
      ${createBasePrompt.userPrompt}`,
    );

    return { response: res.finalOutput };
  }
}

export default AgentService;
