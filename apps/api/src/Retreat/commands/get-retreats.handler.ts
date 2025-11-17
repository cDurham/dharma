import { Inject } from "@nestjs/common";
import { type IQueryHandler, QueryHandler } from "@nestjs/cqrs";

import type { db as DbType } from "../../db/data-source.js";
import { DB_TOKEN } from "../../db/database.module.js";
import { retreat } from "../../db/schema/index.js";
import type { RetreatEntity } from "../retreat.entity.js";
import { GetRetreatsQuery } from "./get-retreats.query.js";

@QueryHandler(GetRetreatsQuery)
export class GetRetreatsHandler implements IQueryHandler<GetRetreatsQuery> {
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType,
  ) {}

  async execute(): Promise<RetreatEntity[]> {
    return await this.db.select().from(retreat);
  }
}
