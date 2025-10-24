import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { DB_TOKEN } from "../../db/database.module";
import { db as DbType } from "../../db/data-source";
import { member } from "../../db/schema";
import { Member } from "../member.entity";
import { GetMemberQuery } from "./get-member.query";

@QueryHandler(GetMemberQuery)
export class GetMemberHandler implements IQueryHandler<GetMemberQuery> {
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType
  ) {}

  async execute({ memberUuid }: GetMemberQuery): Promise<Member | null> {
    const [result] = await this.db
      .select()
      .from(member)
      .where(eq(member.uuid, memberUuid));

    return result || null;
  }
}
