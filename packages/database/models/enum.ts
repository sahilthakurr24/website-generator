import { pgEnum } from "drizzle-orm/pg-core";


export const workspacePlanEnum = pgEnum("workspace_plan", ["free", "pro", "team", "enterprise"]);
export const workspaceMemberRoleEnum = pgEnum("workspace_member_role", [
  "owner",
  "admin",
  "member",
  "viewer",
]);
export const workspaceInvitationStatusEnum = pgEnum("workspace_invitation_status", [
  "pending",
  "accepted",
  "revoked",
  "expired",
]);

export const projectVisibilityEnum = pgEnum("project_visibility", [
  "private",
  "workspace",
  "public",
]);
export const projectStatusEnum = pgEnum("project_status", ["active", "archived"]);
export const projectMemberRoleEnum = pgEnum("project_member_role", ["editor", "viewer"]);
export const projectFileKindEnum = pgEnum("project_file_kind", ["file", "directory"]);

export const conversationStatusEnum = pgEnum("conversation_status", ["active", "archived"]);
export const messageRoleEnum = pgEnum("message_role", ["user", "assistant", "system", "tool"]);
export const generationStatusEnum = pgEnum("generation_status", [
  "queued",
  "running",
  "succeeded",
  "failed",
  "cancelled",
]);
export const generationFileChangeActionEnum = pgEnum("generation_file_change_action", [
  "created",
  "updated",
  "deleted",
]);

export const deploymentStatusEnum = pgEnum("deployment_status", [
  "queued",
  "building",
  "ready",
  "failed",
  "cancelled",
]);
export const domainStatusEnum = pgEnum("domain_status", ["pending", "verified", "failed"]);

export const assetKindEnum = pgEnum("asset_kind", ["image", "font", "document", "other"]);
export const auditActorTypeEnum = pgEnum("audit_actor_type", ["user", "service", "system"]);
