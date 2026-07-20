import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@repo/database";
import { nextCookies } from "better-auth/next-js";
import { env } from "./env.js";
import {
  accountsTable,
  sessionsTable,
  usersTable,
  verificationsTable,
} from "@repo/database/schema";
export const auth = betterAuth({
  secret : env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: usersTable,
      session: sessionsTable,
      account: accountsTable,
      verfication: verificationsTable,
    },
  }),
  // Let Postgres generate uuid primary keys
  advanced: {
    database: {
      generateId: false,
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [nextCookies()],
});
 