import { Inject } from "@nestjs/common";
import { type IQueryHandler, QueryHandler } from "@nestjs/cqrs";

import type { db as DbType } from "../../db/data-source";
import { DB_TOKEN } from "../../db/database.module";
import { member } from "../../db/schema";
import type { Member } from "../member.entity";
import { GetMembersQuery } from "./get-members.query";

@QueryHandler(GetMembersQuery)
export class GetMembersHandler implements IQueryHandler<GetMembersQuery> {
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType
  ) {}

  async execute(): Promise<Member[]> {
    return await this.db.select().from(member);
  }
}
