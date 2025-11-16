import type { UserRow } from "../db/types";

export class User implements UserRow {
  uuid!: string;
  firstName!: string;
  lastName!: string;
  email!: string;
  password!: string;
  verificationToken!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}
