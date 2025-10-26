import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DB_TOKEN } from "../../db/database.module";
import { db as DbType } from "../../db/data-source";
import { userReadModel } from "../../db/schema";
import { UserDeletedEvent } from "../event/user-deleted.event";

@EventsHandler(UserDeletedEvent)
export class UserDeletedProjection implements IEventHandler<UserDeletedEvent> {
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType
  ) {}

  async handle(event: UserDeletedEvent) {
    await this.db.delete(userReadModel).where(eq(userReadModel.uuid, event.userUuid));
  }
}

