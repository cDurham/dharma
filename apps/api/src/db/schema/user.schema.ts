import { pgTable, unique, varchar } from "drizzle-orm/pg-core";
import { baseColumns } from "./base.schema.js";

/**
 * User table - extends Person with authentication fields
 */
export const user = pgTable(
  "user",
  {
    ...baseColumns,
    firstName: varchar("first_name", { length: 255 }).notNull(),
    lastName: varchar("last_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    verificationToken: varchar("verification_token", { length: 255 }),
  },
  (table) => ({
    emailUnique: unique().on(table.email),
  }),
);
