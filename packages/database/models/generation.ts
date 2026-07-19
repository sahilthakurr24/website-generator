import { index, pgTable, uniqueIndex } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import {
  conversationStatusEnum,
  generationFileChangeActionEnum,
  generationStatusEnum,
  messageRoleEnum,
} from "./enum";
import { projectFileRevisionsTable, projectFilesTable, projectsTable } from "./project";
import { usersTable } from "./user";

export const conversationsTable = pgTable(
  "conversations",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    projectId: t
      .uuid("project_id")
      .notNull()
      .references(() => projectsTable.id, { onDelete: "cascade" }),
    createdByUserId: t
      .text("created_by_user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "restrict" }),
    title: t.varchar("title", { length: 255 }),
    summary: t.text("summary"),
    status: conversationStatusEnum("status").default("active").notNull(),
    createdAt: t.timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: t.timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    archivedAt: t.timestamp("archived_at", { withTimezone: true }),
  },
  (table) => [index("conversations_project_updated_at_idx").on(table.projectId, table.updatedAt)],
);

export const conversationMessagesTable = pgTable(
  "conversation_messages",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    conversationId: t
      .uuid("conversation_id")
      .notNull()
      .references(() => conversationsTable.id, { onDelete: "cascade" }),
    sequence: t.integer("sequence").notNull(),
    role: messageRoleEnum("role").notNull(),
    content: t.text("content").notNull(),
    metadata: t.jsonb("metadata").notNull().default({}),
    createdByUserId: t.text("created_by_user_id").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    createdAt: t.timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("conversation_messages_conversation_sequence_unique").on(
      table.conversationId,
      table.sequence,
    ),
    index("conversation_messages_conversation_created_at_idx").on(
      table.conversationId,
      table.createdAt,
    ),
  ],
);

export const generationRunsTable = pgTable(
  "generation_runs",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    projectId: t
      .uuid("project_id")
      .notNull()
      .references(() => projectsTable.id, { onDelete: "cascade" }),
    conversationId: t.uuid("conversation_id").references(() => conversationsTable.id, {
      onDelete: "set null",
    }),
    requestedByUserId: t
      .text("requested_by_user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "restrict" }),
    sourceMessageId: t.uuid("source_message_id").references(() => conversationMessagesTable.id, {
      onDelete: "set null",
    }),
    provider: t.varchar("provider", { length: 64 }).notNull(),
    model: t.varchar("model", { length: 128 }).notNull(),
    status: generationStatusEnum("status").default("queued").notNull(),
    inputTokens: t.integer("input_tokens"),
    outputTokens: t.integer("output_tokens"),
    totalCostMicros: t.bigint("total_cost_micros", { mode: "number" }),
    errorCode: t.varchar("error_code", { length: 128 }),
    errorMessage: t.text("error_message"),
    startedAt: t.timestamp("started_at", { withTimezone: true }),
    completedAt: t.timestamp("completed_at", { withTimezone: true }),
    createdAt: t.timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: t.timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("generation_runs_project_created_at_idx").on(table.projectId, table.createdAt),
    index("generation_runs_status_created_at_idx").on(table.status, table.createdAt),
    index("generation_runs_requested_by_user_id_idx").on(table.requestedByUserId),
  ],
);

export const generationFileChangesTable = pgTable(
  "generation_file_changes",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    generationRunId: t
      .uuid("generation_run_id")
      .notNull()
      .references(() => generationRunsTable.id, { onDelete: "cascade" }),
    projectFileId: t.uuid("project_file_id").references(() => projectFilesTable.id, {
      onDelete: "set null",
    }),
    projectFileRevisionId: t
      .uuid("project_file_revision_id")
      .references(() => projectFileRevisionsTable.id, { onDelete: "set null" }),
    action: generationFileChangeActionEnum("action").notNull(),
    path: t.text("path").notNull(),
    createdAt: t.timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("generation_file_changes_run_id_idx").on(table.generationRunId)],
);
