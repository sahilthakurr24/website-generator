import z from "zod";

export const workspaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  plan: z.enum(["free", "pro", "team", "enterprise"]),
  ownerId: z.string(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
  deletedAt: z.date().nullable(),
});

export const createWorkspaceInputSchema = z.object({
  name: z
    .string()
    .min(5, "Name must be at least 5 characters.")
    .max(20, "Name cannot exceed 20 characters")
    .describe("Name of the workspace"),
  plan: z.enum(["free", "pro", "team", "enterprise"]).describe("Plan of the workspace"),
});

export const createWorkspaceOutputSchema = z.object({
  id: z.string().describe("Id of the created workspace").optional(),
});

export const getWorkspaceBySlugInputSchema = z.object({
  slug: z.string().describe("Slug of the workspace"),
});

export const getWorkspaceBySlugOutputSchema = z.object({
  workspace: workspaceSchema.optional(),
});

export const getWorkspaceByIdInputSchema = z.object({
  id: z.string().describe("Id of the workspace"),
});

export const getWorkspaceByIdOutputSchema = z.object({
  workspace: workspaceSchema.optional(),
});

export const getUserWorkspacesOutputSchema = z.object({
  workspaces: z.array(workspaceSchema).optional(),
});

export const updateWorkspaceInputSchema = z.object({
  name: z
    .string()
    .min(5, "Name must be at least 5 characters.")
    .max(20, "Name cannot exceed 20 characters")
    .describe("New name of the workspace"),
  slug: z.string().describe("slug of the workspace to be updated"),
});

export const updateWorkspaceOutputSchema = z.object({
  id : z.string().describe('Id of the updated workspace')
})

export const deleteWorkspaceInputSchema = z.object({
  slug: z.string().describe("slug of the workspace to be deleted"),
});

export const deleteWorkspaceOutputSchema = z.object({
  id : z.string().describe('Id of the deleted workspace')
})