import { Inject } from "@nestjs/common";
import { type IQueryHandler, QueryHandler } from "@nestjs/cqrs";

import type { db as DbType } from "../../db/data-source";
import { DB_TOKEN } from "../../db/database.module";
import { retreat } from "../../db/schema";
import type { Retreat } from "../retreat.entity";
import { GetRetreatsQuery } from "./get-retreats.query";

@QueryHandler(GetRetreatsQuery)
export class GetRetreatsHandler implements IQueryHandler<GetRetreatsQuery> {
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType
  ) {}

  async execute(): Promise<Retreat[]> {
    return await this.db.select().from(retreat);
  }
}
