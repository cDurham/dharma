import { Inject } from "@nestjs/common";
import { type IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { eq } from "drizzle-orm";

import type { db as DbType } from "../../db/data-source";
import { DB_TOKEN } from "../../db/database.module";
import { user } from "../../db/schema";
import type { User } from "../user.entity";
import { GetUserByEmailQuery } from "./get-user-by-email.query";

@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailHandler
  implements IQueryHandler<GetUserByEmailQuery>
{
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType
  ) {}

  async execute({ email }: GetUserByEmailQuery): Promise<User | null> {
    const [result] = await this.db
      .select()
      .from(user)
      .where(eq(user.email, email));

    return result || null;
  }
}
