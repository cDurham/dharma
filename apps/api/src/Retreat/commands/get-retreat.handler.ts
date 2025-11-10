import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { DB_TOKEN } from "../../db/database.module";
import { db as DbType } from "../../db/data-source";
import { retreat } from "../../db/schema";
import { Retreat } from "../retreat.entity";
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
