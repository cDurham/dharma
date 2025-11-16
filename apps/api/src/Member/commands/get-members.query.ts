import { Query } from "@nestjs/cqrs";
import type { Member } from "../member.entity";

export class GetMembersQuery extends Query<Member[]> {}
