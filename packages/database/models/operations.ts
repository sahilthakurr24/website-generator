import { index, pgTable, uniqueIndex } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { assetKindEnum, auditActorTypeEnum } from "./enum";
import { projectsTable } from "./project";
import { usersTable } from "./user";
import { workspacesTable } from "./workspace";

export const projectAssetsTable = pgTable(
  "project_assets",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    projectId: t
      .uuid("project_id")
      .notNull()
      .references(() => projectsTable.id, { onDelete: "cascade" }),
    uploadedByUserId: t.text("uploaded_by_user_id").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    kind: assetKindEnum("kind").notNull(),
    originalFilename: t.varchar("original_filename", { length: 255 }).notNull(),
    storageKey: t.text("storage_key").notNull().unique(),
    mimeType: t.varchar("mime_type", { length: 255 }).notNull(),
    byteSize: t.integer("byte_size").notNull(),
    checksum: t.char("checksum", { length: 64 }).notNull(),
    createdAt: t.timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: t.timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [index("project_assets_project_created_at_idx").on(table.projectId, table.createdAt)],
);

export const auditLogsTable = pgTable(
  "audit_logs",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    workspaceId: t
      .uuid("workspace_id")
      .references(() => workspacesTable.id, { onDelete: "set null" }),
    projectId: t.uuid("project_id").references(() => projectsTable.id, { onDelete: "set null" }),
    actorType: auditActorTypeEnum("actor_type").notNull(),
    actorUserId: t.text("actor_user_id").references(() => usersTable.id, { onDelete: "set null" }),
    action: t.varchar("action", { length: 128 }).notNull(),
    entityType: t.varchar("entity_type", { length: 64 }).notNull(),
    entityId: t.text("entity_id"),
    metadata: t.jsonb("metadata").notNull().default({}),
    ipAddress: t.text("ip_address"),
    userAgent: t.text("user_agent"),
    createdAt: t.timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("audit_logs_workspace_created_at_idx").on(table.workspaceId, table.createdAt),
    index("audit_logs_project_created_at_idx").on(table.projectId, table.createdAt),
  ],
);

export const workspaceBillingCustomersTable = pgTable(
  "workspace_billing_customers",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    workspaceId: t
      .uuid("workspace_id")
      .notNull()
      .references(() => workspacesTable.id, { onDelete: "cascade" }),
    provider: t.varchar("provider", { length: 64 }).notNull(),
    providerCustomerId: t.varchar("provider_customer_id", { length: 255 }).notNull(),
    createdAt: t.timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: t.timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("workspace_billing_customers_workspace_provider_unique").on(
      table.workspaceId,
      table.provider,
    ),
    uniqueIndex("workspace_billing_customers_provider_customer_unique").on(
      table.provider,
      table.providerCustomerId,
    ),
  ],
);
