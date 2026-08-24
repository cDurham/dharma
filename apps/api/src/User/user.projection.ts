import type { UserRow } from "../db/types.js";
import type { User } from "./user.type.js";

/**
 * The only projection through which a user leaves the API. The parameter
 * type cannot carry `password` or `verificationToken`.
 */
export type PublicUserSource = Pick<
  UserRow,
  "uuid" | "firstName" | "lastName" | "email" | "createdAt" | "updatedAt"
>;

export function toPublicUser(row: PublicUserSource): User {
  return {
    uuid: row.uuid,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
