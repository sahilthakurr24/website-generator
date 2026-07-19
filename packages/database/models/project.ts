import { index, pgTable, uniqueIndex } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import {
  projectFileKindEnum,
  projectMemberRoleEnum,
  projectStatusEnum,
  projectVisibilityEnum,
} from "./enum";
import { usersTable } from "./user";
import { workspacesTable } from "./workspace";

export const projectsTable = pgTable(
  "projects",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    workspaceId: t
      .uuid("workspace_id")
      .notNull()
      .references(() => workspacesTable.id, { onDelete: "cascade" }),
    createdByUserId: t
      .text("created_by_user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "restrict" }),
    name: t.varchar("name", { length: 120 }).notNull(),
    slug: t.varchar("slug", { length: 128 }).notNull(),
    description: t.text("description"),
    visibility: projectVisibilityEnum("visibility").default("private").notNull(),
    status: projectStatusEnum("status").default("active").notNull(),
    framework: t.varchar("framework", { length: 64 }),
    settings: t.jsonb("settings").notNull().default({}),
    createdAt: t.timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: t.timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    archivedAt: t.timestamp("archived_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("projects_workspace_slug_unique").on(table.workspaceId, table.slug),
    index("projects_workspace_updated_at_idx").on(table.workspaceId, table.updatedAt),
    index("projects_created_by_user_id_idx").on(table.createdByUserId),
  ],
);

export const projectMembersTable = pgTable(
  "project_members",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    projectId: t
      .uuid("project_id")
      .notNull()
      .references(() => projectsTable.id, { onDelete: "cascade" }),
    userId: t
      .text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    role: projectMemberRoleEnum("role").default("viewer").notNull(),
    createdAt: t.timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: t.timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("project_members_project_user_unique").on(table.projectId, table.userId),
    index("project_members_user_id_idx").on(table.userId),
  ],
);

export const projectFilesTable = pgTable(
  "project_files",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    projectId: t
      .uuid("project_id")
      .notNull()
      .references(() => projectsTable.id, { onDelete: "cascade" }),
    name: t.varchar("name", { length: 255 }).notNull(),
    path: t.text("path").notNull(),
    kind: projectFileKindEnum("kind").notNull(),
    mimeType: t.varchar("mime_type", { length: 255 }),
    createdAt: t.timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: t.timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: t.timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("project_files_project_path_unique").on(table.projectId, table.path),
    index("project_files_project_kind_idx").on(table.projectId, table.kind),
  ],
);

export const projectFileRevisionsTable = pgTable(
  "project_file_revisions",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    fileId: t
      .uuid("file_id")
      .notNull()
      .references(() => projectFilesTable.id, { onDelete: "cascade" }),
    revision: t.integer("revision").notNull(),
    content: t.text("content").notNull(),
    contentHash: t.char("content_hash", { length: 64 }).notNull(),
    byteSize: t.integer("byte_size").notNull(),
    createdByUserId: t.text("created_by_user_id").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    createdAt: t.timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("project_file_revisions_file_revision_unique").on(table.fileId, table.revision),
    index("project_file_revisions_file_created_at_idx").on(table.fileId, table.createdAt),
  ],
);
