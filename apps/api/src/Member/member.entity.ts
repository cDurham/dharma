import type { User } from "../User/user.entity";
import type { MemberRow } from "../db/types";

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
