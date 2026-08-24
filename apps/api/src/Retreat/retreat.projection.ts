import type { RetreatRow } from "../db/types.js";
import type { Retreat } from "./retreat.type.js";

export function toPublicRetreat(row: RetreatRow): Retreat {
  return {
    uuid: row.uuid,
    name: row.name,
    startAt: row.startAt,
    endAt: row.endAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
