import type { User } from "../User/user.entity.js";
import type { MemberRow } from "../db/types.js";

export class Member implements Omit<MemberRow, "userUuid"> {
  uuid!: string;
  firstName!: string;
  lastName!: string;
  joinDate!: Date;
  user?: User | null;
  createdAt!: Date;
  updatedAt!: Date;
  userUuid?: string | null;
}
