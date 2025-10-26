import { RetreatRow } from "../db/types";

export type UpdatableRetreatFields = Omit<
  RetreatRow,
  'uuid' | 'createdAt' | 'updatedAt'
>;

export type RetreatState = RetreatRow & {
  deleted?: boolean;
};

