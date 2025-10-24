import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { DB_TOKEN } from "../../db/database.module";
import { db as DbType } from "../../db/data-source";
import { user } from "../../db/schema";
import { User } from "../user.entity";
import { GetUserQuery } from "./get-user.query";

@QueryHandler(GetUserQuery)
export class GetUserHandler
  implements IQueryHandler<GetUserQuery, User | null>
{
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType
  ) {}

  async execute({ userUuid }: GetUserQuery): Promise<User> {
    const [result] = await this.db
      .select()
      .from(user)
      .where(eq(user.uuid, userUuid));

    if (!result) {
      throw new Error("User not found");
    }

    return result;
  }
}
