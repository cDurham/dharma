import type { MemberRow } from "../db/types.js";
import type { Member } from "./member.type.js";

export function toPublicMember(row: MemberRow): Member {
  return {
    uuid: row.uuid,
    firstName: row.firstName,
    lastName: row.lastName,
    joinDate: row.joinDate,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    userUuid: row.userUuid ?? null,
  };
}
