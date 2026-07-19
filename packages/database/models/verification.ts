import { pgTable } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

export const verificationsTable = pgTable("verifications", {
  id: t.text("id").primaryKey(),
  identifier: t.text("identifier").notNull(),
  value: t.text("value").notNull(),
  expiresAt: t.timestamp("expires_at", { precision: 6, withTimezone: true }).notNull(),
  createdAt: t.timestamp("created_at", { precision: 6, withTimezone: true }).notNull(),
  updatedAt: t.timestamp("updated_at", { precision: 6, withTimezone: true }).notNull(),
});


export type VerificationInsert = typeof verificationsTable.$inferInsert;
export type VerificationSelect= typeof verificationsTable.$inferSelect;
