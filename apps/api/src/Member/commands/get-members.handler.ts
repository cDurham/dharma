import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";

import { DB_TOKEN } from "../../db/database.module";
import { db as DbType } from "../../db/data-source";
import { member } from "../../db/schema";
import { Member } from "../member.entity";
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
