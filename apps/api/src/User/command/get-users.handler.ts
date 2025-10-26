import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";

import { DB_TOKEN } from "../../db/database.module";
import { db as DbType } from "../../db/data-source";
import { userReadModel } from "../../db/schema";
import { User } from "../user.entity";
import { GetUsersQuery } from "./get-users.query";

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType
  ) {}

  async execute(): Promise<User[]> {
    return await this.db.select().from(userReadModel);
  }
}
