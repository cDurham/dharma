import { Query } from "@nestjs/cqrs";
import type { MemberEntity } from "../member.entity.js";

export class GetMemberQuery extends Query<MemberEntity | null> {
  constructor(public readonly memberUuid: string) {
    super();
  }
}
