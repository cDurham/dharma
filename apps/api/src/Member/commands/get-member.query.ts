import { Query } from "@nestjs/cqrs";
import type { Member } from "../member.entity.js";

export class GetMemberQuery extends Query<Member | null> {
  constructor(public readonly memberUuid: string) {
    super();
  }
}
