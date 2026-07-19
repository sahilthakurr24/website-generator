import { index, pgTable } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

export const usersTable = pgTable(
  "users",
  {
    id: t.text("id").primaryKey(),
    name: t.text("name").notNull(),
    email: t.varchar("email", { length: 255 }).notNull().unique(),
    emailVerified: t.boolean("email_verified").default(false).notNull(),
    image: t.text("image"),
    createdAt: t
      .timestamp("created_at", { precision: 6, withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: t
      .timestamp("updated_at", { precision: 6, withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("users_created_at_idx").on(table.createdAt)],
);

export type SelectUser = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
