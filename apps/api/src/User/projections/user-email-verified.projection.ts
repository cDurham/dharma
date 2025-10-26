import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DB_TOKEN } from "../../db/database.module";
import { db as DbType } from "../../db/data-source";
import { userReadModel } from "../../db/schema";
import { UserEmailVerifiedEvent } from "../event/user-email-verified.event";

@EventsHandler(UserEmailVerifiedEvent)
export class UserEmailVerifiedProjection
  implements IEventHandler<UserEmailVerifiedEvent>
{
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType
  ) {}

  async handle(event: UserEmailVerifiedEvent) {
    await this.db
      .update(userReadModel)
      .set({ verificationToken: null, updatedAt: new Date() })
      .where(eq(userReadModel.uuid, event.userUuid));
  }
}
