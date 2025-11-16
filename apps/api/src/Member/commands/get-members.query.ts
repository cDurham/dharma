import { Query } from "@nestjs/cqrs";
import type { Member } from "../member.entity.js";

export class GetMembersQuery extends Query<Member[]> {}
