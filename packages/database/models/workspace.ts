import { index, pgTable, uniqueIndex } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { workspaceInvitationStatusEnum, workspaceMemberRoleEnum, workspacePlanEnum } from "./enum";
import { usersTable } from "./user";

export const workspacesTable = pgTable(
  "workspaces",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    name: t.varchar("name", { length: 120 }).notNull(),
    slug: t.varchar("slug", { length: 128 }).notNull().unique(),
    plan: workspacePlanEnum("plan").default("free").notNull(),
    ownerId: t
      .text("owner_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "restrict" }),
    createdAt: t.timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: t.timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: t.timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [index("workspaces_owner_id_idx").on(table.ownerId)],
);

export const workspaceMembersTable = pgTable(
  "workspace_members",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    workspaceId: t
      .uuid("workspace_id")
      .notNull()
      .references(() => workspacesTable.id, { onDelete: "cascade" }),
    userId: t
      .text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    role: workspaceMemberRoleEnum("role").default("member").notNull(),
    createdAt: t.timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: t.timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("workspace_members_workspace_user_unique").on(table.workspaceId, table.userId),
    index("workspace_members_user_id_idx").on(table.userId),
  ],
);

export const workspaceInvitationsTable = pgTable(
  "workspace_invitations",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    workspaceId: t
      .uuid("workspace_id")
      .notNull()
      .references(() => workspacesTable.id, { onDelete: "cascade" }),
    email: t.varchar("email", { length: 255 }).notNull(),
    role: workspaceMemberRoleEnum("role").default("member").notNull(),
    tokenHash: t.varchar("token_hash", { length: 255 }).notNull().unique(),
    status: workspaceInvitationStatusEnum("status").default("pending").notNull(),
    invitedByUserId: t
      .text("invited_by_user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "restrict" }),
    expiresAt: t.timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: t.timestamp("accepted_at", { withTimezone: true }),
    createdAt: t.timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: t.timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("workspace_invitations_workspace_email_unique").on(table.workspaceId, table.email),
    index("workspace_invitations_expires_at_idx").on(table.expiresAt),
  ],
);
