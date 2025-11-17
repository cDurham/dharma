import { Query } from "@nestjs/cqrs";
import type { MemberEntity } from "../member.entity.js";

export class GetMembersQuery extends Query<MemberEntity[]> {}
