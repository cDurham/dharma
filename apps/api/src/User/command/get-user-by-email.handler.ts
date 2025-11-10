import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { DB_TOKEN } from "../../db/database.module";
import { db as DbType } from "../../db/data-source";
import { user } from "../../db/schema";
import { GetUserByEmailQuery } from "./get-user-by-email.query";
import { User } from "../user.entity";

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
