import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DB_TOKEN } from "../../db/database.module";
import { db as DbType } from "../../db/data-source";
import { userReadModel } from "../../db/schema";
import { UserPasswordChangedEvent } from "../event/user-password-changed.event";

@EventsHandler(UserPasswordChangedEvent)
export class UserPasswordChangedProjection
  implements IEventHandler<UserPasswordChangedEvent>
{
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType
  ) {}

  async handle(event: UserPasswordChangedEvent) {
    await this.db
      .update(userReadModel)
      .set({ password: event.newPassword, updatedAt: new Date() })
      .where(eq(userReadModel.uuid, event.userUuid));
  }
}

