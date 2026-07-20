import { getUserWorkspacesSchema } from "@repo/services/workspace/model";
import { zodUndefinedModel } from "../../schema";
import { workspaceService } from "../../services";
import { authenticatedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
  createWorkspaceInputSchema,
  createWorkspaceOutputSchema,
  deleteWorkspaceInputSchema,
  deleteWorkspaceOutputSchema,
  getUserWorkspacesOutputSchema,
  getWorkspaceByIdInputSchema,
  getWorkspaceByIdOutputSchema,
  getWorkspaceBySlugInputSchema,
  getWorkspaceBySlugOutputSchema,
  updateWorkspaceInputSchema,
  updateWorkspaceOutputSchema,
} from "./model";
import { deleteAccountOutputSchmea } from "../auth/model";

const TAGS = ["Workspace"];
const getPath = generatePath("/workspace");

export const workspaceRouter = router({
  createWorkspace: authenticatedProcedure
    .meta({ openapi: { method: "POST", path: getPath("create-workspace"), tags: TAGS } })
    .input(createWorkspaceInputSchema)
    .output(createWorkspaceOutputSchema)
    .mutation(async ({ input, ctx }) => {
      const modifiedInput = {
        ...input,
        ownerId: ctx.userId,
      };
      return await workspaceService.createWorkspace(modifiedInput);
    }),
  getWorkSpaceBySlug: authenticatedProcedure
    .meta({ openapi: { method: "GET", path: getPath("get-workspace-by-slug"), tags: TAGS } })
    .input(getWorkspaceBySlugInputSchema)
    .output(getWorkspaceBySlugOutputSchema)
    .query(async ({ input }) => {
      return await workspaceService.getWorkspaceBySlug(input);
    }),
  getWorkSpaceById: authenticatedProcedure
    .meta({ openapi: { method: "GET", path: getPath("get-workspace-by-id"), tags: TAGS } })
    .input(getWorkspaceByIdInputSchema)
    .output(getWorkspaceByIdOutputSchema)
    .query(async ({ input }) => {
      return await workspaceService.getWorkspaceById(input);
    }),
  getUserWorspaces: authenticatedProcedure
    .meta({ openapi: { method: "GET", path: getPath("get-user-workspaces"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(getUserWorkspacesOutputSchema)
    .query(async ({ ctx }) => {
      return await workspaceService.getUserWorkspaces({ userId: ctx.userId });
    }),
  updateWorspace: authenticatedProcedure
    .meta({ openapi: { method: "PATCH", path: getPath("update-workspace"), tags: TAGS } })
    .input(updateWorkspaceInputSchema)
    .output(updateWorkspaceOutputSchema)
    .mutation(async ({ input, ctx }) => {
      const modifiedInput = {
        ...input,
        userId: ctx.userId,
      };

      return await workspaceService.updateWorkspace(modifiedInput);
    }),
  deleteWorspace: authenticatedProcedure
    .meta({ openapi: { method: "DELETE", path: getPath("delete-workspace"), tags: TAGS } })
    .input(deleteWorkspaceInputSchema)
    .output(deleteWorkspaceOutputSchema)
    .mutation(async ({ input, ctx }) => {
      const modifiedInput = {
        ...input,
        userId: ctx.userId,
      };

      return await workspaceService.deleteWorkspace(modifiedInput);
    }),
});
