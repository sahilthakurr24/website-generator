import { db, eq, and } from "@repo/database";
import {
  createWorkspaceSchema,
  CreateWorkspaceSchemaType,
  deleteOrganizationSchema,
  DeleteWorkspaceSchemaType,
  getUserWorkspacesSchema,
  GetUserWorkspacesType,
  getWorkspaceByIdSchema,
  GetWorkspaceByIdType,
  getWorkspaceBySlugSchema,
  GetWorkspaceBySlugType,
  updateWorkspaceSchema,
  UpdatWorkspaceSchemaType,
} from "./model";
import slugify from "slugify";
import crypto from "node:crypto";
import { workspacesTable } from "@repo/database/schema";

class WorkspaceService {
  private enhancedName(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }
  private createSlug(word: string): string {
    const baseSlug = slugify(word, {
      lower: true,
      strict: true,
    });

    return `${baseSlug}-${crypto.randomUUID().slice(0, 6)}`;
  }

  public async createWorkspace(payload: CreateWorkspaceSchemaType) {
    const { name, plan, ownerId } = await createWorkspaceSchema.parseAsync(payload);
    const enhancedName = this.enhancedName(name);
    const slug = this.createSlug(enhancedName);

    const [creaetedWorkspace] = await db
      .insert(workspacesTable)
      .values({
        name: enhancedName,
        plan,
        slug,
        ownerId,
      })
      .returning({ id: workspacesTable.id });

    return { id: creaetedWorkspace?.id };
  }

  public async getWorkspaceBySlug(payload: GetWorkspaceBySlugType) {
    const { slug } = await getWorkspaceBySlugSchema.parseAsync(payload);

    const [workspace] = await db
      .select()
      .from(workspacesTable)
      .where(eq(workspacesTable.slug, slug));
    if (!workspace) throw new Error(`Workspace with slug ${slug} not available`);
    return { workspace };
  }

  public async getWorkspaceById(payload: GetWorkspaceByIdType) {
    const { id } = await getWorkspaceByIdSchema.parseAsync(payload);

    const [workspace] = await db.select().from(workspacesTable).where(eq(workspacesTable.id, id));
    if (!workspace) throw new Error(`Workspace with id ${id} not available`);
    return { workspace };
  }
  public async updateWorkspace(payload: UpdatWorkspaceSchemaType) {
    const { name, slug, userId } = await updateWorkspaceSchema.parseAsync(payload);

    const [updatedWorkspace] = await db
      .update(workspacesTable)
      .set({
        name,
        updatedAt: new Date(),
      })
      .where(and(eq(workspacesTable.slug, slug), eq(workspacesTable.ownerId, userId)))
      .returning({
        id: workspacesTable.id,
      });

    if (!updatedWorkspace) {
      throw new Error("Workspace not found or you don't have permission to update it.");
    }

    return { id: updatedWorkspace.id };
  }

  public async deleteWorkspace(payload: DeleteWorkspaceSchemaType) {
    const { slug, userId } = await deleteOrganizationSchema.parseAsync(payload);
    const [deletedWorkspace] = await db
      .delete(workspacesTable)
      .where(and(eq(workspacesTable.slug, slug), eq(workspacesTable.ownerId, userId)))
      .returning({ id: workspacesTable.id });

    if (!deletedWorkspace) {
      throw new Error("Workspace not found or you don't have permission to delete it.");
    }
    return { id: deletedWorkspace?.id };
  }

  public async getUserWorkspaces(payload: GetUserWorkspacesType) {
    const { userId } = await getUserWorkspacesSchema.parseAsync(payload);
    const workspaces = await db
      .select()
      .from(workspacesTable)
      .where(eq(workspacesTable.ownerId, userId));

    return { workspaces };
  }
}

export default WorkspaceService;
