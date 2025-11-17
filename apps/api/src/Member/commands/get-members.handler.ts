import { Inject } from "@nestjs/common";
import { type IQueryHandler, QueryHandler } from "@nestjs/cqrs";

import type { db as DbType } from "../../db/data-source.js";
import { DB_TOKEN } from "../../db/database.module.js";
import { member } from "../../db/schema/index.js";
import type { MemberEntity } from "../member.entity.js";
import { GetMembersQuery } from "./get-members.query.js";

@QueryHandler(GetMembersQuery)
export class GetMembersHandler implements IQueryHandler<GetMembersQuery> {
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType,
  ) {}

  async execute(): Promise<MemberEntity[]> {
    return await this.db.select().from(member);
  }
}
