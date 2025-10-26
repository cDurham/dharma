import { InferSelectModel } from "drizzle-orm";
import { memberReadModel } from "../db/schema";

export type MemberReadModelRow = InferSelectModel<typeof memberReadModel>;

export type UpdatableMemberFields = Omit<
  MemberReadModelRow,
  'uuid' | 'createdAt' | 'updatedAt' | 'joinDate'
>;

export type MemberState = MemberReadModelRow & {
  deleted?: boolean;
};

