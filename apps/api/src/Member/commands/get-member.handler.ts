import { Inject } from "@nestjs/common";
import { type IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { eq } from "drizzle-orm";

import type { db as DbType } from "../../db/data-source.js";
import { DB_TOKEN } from "../../db/database.module.js";
import { member } from "../../db/schema/index.js";
import type { MemberEntity } from "../member.entity.js";
import { GetMemberQuery } from "./get-member.query.js";

@QueryHandler(GetMemberQuery)
export class GetMemberHandler implements IQueryHandler<GetMemberQuery> {
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType,
  ) {}

  async execute({ memberUuid }: GetMemberQuery): Promise<MemberEntity | null> {
    const [result] = await this.db
      .select()
      .from(member)
      .where(eq(member.uuid, memberUuid));

    return result || null;
  }
}
