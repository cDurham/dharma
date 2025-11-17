import type { MemberRow } from "../db/types.js";

export class MemberEntity implements MemberRow {
  uuid!: string;
  firstName!: string;
  lastName!: string;
  joinDate!: Date;
  userUuid!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}
