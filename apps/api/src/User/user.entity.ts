import type { UserRow } from "../db/types.js";

export class UserEntity implements UserRow {
  uuid!: string;
  firstName!: string;
  lastName!: string;
  email!: string;
  password!: string;
  verificationToken!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}
