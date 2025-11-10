import { Query } from "@nestjs/cqrs";
import { Member } from "../member.entity";

export class GetMembersQuery extends Query<Member[]> {}
