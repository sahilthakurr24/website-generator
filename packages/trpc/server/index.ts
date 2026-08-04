import { router } from "./trpc";

import { healthRouter } from "./routes/health/route";
import { authRouter } from "./routes/auth/route";
import { workspaceRouter } from "./routes/workspace/route";
import { chatRouter } from "./routes/chat/route";
import { templateRouter } from "./routes/template/route";

export const serverRouter = router({
  health: healthRouter,
  auth: authRouter,
  workspace: workspaceRouter,
  chat: chatRouter,
  template: templateRouter,
});

export { createContext } from "./context";
export type ServerRouter = typeof serverRouter;
