import { Inject } from "@nestjs/common";
import { type IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { eq } from "drizzle-orm";

import type { db as DbType } from "../../db/data-source.js";
import { DB_TOKEN } from "../../db/database.module.js";
import { user } from "../../db/schema/index.js";
import type { UserEntity } from "../user.entity.js";
import { GetUserQuery } from "./get-user.query.js";

@QueryHandler(GetUserQuery)
export class GetUserHandler
  implements IQueryHandler<GetUserQuery, UserEntity | null>
{
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType,
  ) {}

  async execute({ userUuid }: GetUserQuery): Promise<UserEntity | null> {
    const [result] = await this.db
      .select()
      .from(user)
      .where(eq(user.uuid, userUuid));

    return result || null;
  }
}
