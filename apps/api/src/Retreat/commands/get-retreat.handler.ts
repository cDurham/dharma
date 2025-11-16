import { Inject } from "@nestjs/common";
import { type IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { eq } from "drizzle-orm";

import type { db as DbType } from "../../db/data-source";
import { DB_TOKEN } from "../../db/database.module";
import { retreat } from "../../db/schema";
import type { Retreat } from "../retreat.entity";
import { GetRetreatQuery } from "./get-retreat.query";

@QueryHandler(GetRetreatQuery)
export class GetRetreatHandler
  implements IQueryHandler<GetRetreatQuery, Retreat | null>
{
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType
  ) {}

  async execute({ uuid }: GetRetreatQuery): Promise<Retreat | null> {
    const [result] = await this.db
      .select()
      .from(retreat)
      .where(eq(retreat.uuid, uuid));

    return result || null;
  }
}
