import { index, pgTable, uniqueIndex } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { deploymentStatusEnum, domainStatusEnum } from "./enum";
import { projectsTable } from "./project";
import { usersTable } from "./user";

export const deploymentsTable = pgTable(
  "deployments",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    projectId: t
      .uuid("project_id")
      .notNull()
      .references(() => projectsTable.id, { onDelete: "cascade" }),
    triggeredByUserId: t.text("triggered_by_user_id").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    provider: t.varchar("provider", { length: 64 }).notNull(),
    providerDeploymentId: t.varchar("provider_deployment_id", { length: 255 }),
    status: deploymentStatusEnum("status").default("queued").notNull(),
    previewUrl: t.text("preview_url"),
    productionUrl: t.text("production_url"),
    buildLogUrl: t.text("build_log_url"),
    errorCode: t.varchar("error_code", { length: 128 }),
    errorMessage: t.text("error_message"),
    startedAt: t.timestamp("started_at", { withTimezone: true }),
    completedAt: t.timestamp("completed_at", { withTimezone: true }),
    createdAt: t.timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: t.timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("deployments_provider_deployment_id_unique").on(
      table.provider,
      table.providerDeploymentId,
    ),
    index("deployments_project_created_at_idx").on(table.projectId, table.createdAt),
    index("deployments_status_created_at_idx").on(table.status, table.createdAt),
  ],
);

export const projectDomainsTable = pgTable(
  "project_domains",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    projectId: t
      .uuid("project_id")
      .notNull()
      .references(() => projectsTable.id, { onDelete: "cascade" }),
    deploymentId: t.uuid("deployment_id").references(() => deploymentsTable.id, {
      onDelete: "set null",
    }),
    hostname: t.varchar("hostname", { length: 253 }).notNull().unique(),
    status: domainStatusEnum("status").default("pending").notNull(),
    verificationToken: t.varchar("verification_token", { length: 255 }),
    verifiedAt: t.timestamp("verified_at", { withTimezone: true }),
    createdAt: t.timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: t.timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("project_domains_project_id_idx").on(table.projectId)],
);
