import type { RetreatRow } from "../db/types.js";

export class Retreat implements RetreatRow {
  uuid!: string;
  name!: string;
  startAt!: Date;
  endAt!: Date;
  createdAt!: Date;
  updatedAt!: Date;
}
