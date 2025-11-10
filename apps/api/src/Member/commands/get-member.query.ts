import { Query } from "@nestjs/cqrs";
import { Member } from "../member.entity";

export class GetMemberQuery extends Query<Member | null> {
  constructor(public readonly memberUuid: string) {
    super();
  }
}
