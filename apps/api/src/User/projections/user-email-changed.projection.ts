import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DB_TOKEN } from "../../db/database.module";
import { db as DbType } from "../../db/data-source";
import { userReadModel } from "../../db/schema";
import { UserEmailChangedEvent } from "../event/user-email-changed.event";

@EventsHandler(UserEmailChangedEvent)
export class UserEmailChangedProjection
  implements IEventHandler<UserEmailChangedEvent>
{
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType
  ) {}

  async handle(event: UserEmailChangedEvent) {
    await this.db
      .update(userReadModel)
      .set({
        email: event.newEmail,
        verificationToken: event.verificationToken,
        updatedAt: new Date(),
      })
      .where(eq(userReadModel.uuid, event.userUuid));
  }
}

