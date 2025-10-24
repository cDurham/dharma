import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";

import { DB_TOKEN } from "../../db/database.module";
import { db as DbType } from "../../db/data-source";
import { retreat } from "../../db/schema";
import { Retreat } from "../retreat.entity";
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
