import z from "zod";

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(5, "Name must be at least 5 characters.")
    .max(20, "Name cannot exceed 20 characters")
    .describe("Name of the workspace"),
  plan: z.enum(["free", "pro", "team", "enterprise"]).describe("Plan of the workspace"),
  ownerId: z.string().describe("Id of the creator"),
});

export type CreateWorkspaceSchemaType = z.infer<typeof createWorkspaceSchema>;

export const getWorkspaceBySlugSchema = z.object({
  slug: z.string().describe("Slug of the workspace"),
});

export type GetWorkspaceBySlugType = z.infer<typeof getWorkspaceBySlugSchema>;

export const getWorkspaceByIdSchema = z.object({
  id: z.string().describe("id of the workspace"),
});

export type GetWorkspaceByIdType = z.infer<typeof getWorkspaceByIdSchema>;

export const updateWorkspaceSchema = z.object({
  name: z
    .string()
    .min(5, "Name must be at least 5 characters.")
    .max(20, "Name cannot exceed 20 characters")
    .describe("New name of the workspace"),
  slug: z.string().describe("slug of the workspace to be updated"),
  userId: z.string().describe("Id of the user"),
});

export type UpdatWorkspaceSchemaType = z.infer<typeof updateWorkspaceSchema>;

export const deleteOrganizationSchema = z.object({
  slug: z.string().describe("Slug of the workspace to be deleted"),
  userId: z.string().describe("Id of the user"),
});

export type DeleteWorkspaceSchemaType = z.infer<typeof deleteOrganizationSchema>;

export const getUserWorkspacesSchema = z.object({
  userId: z.string().describe("Id of the user whose workspaces are querring"),
});

export type GetUserWorkspacesType = z.infer<typeof getUserWorkspacesSchema>;
