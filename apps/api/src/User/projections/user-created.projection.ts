import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { DB_TOKEN } from "../../db/database.module";
import { db as DbType } from "../../db/data-source";
import { userReadModel } from "../../db/schema";
import { UserCreatedEvent } from "../event/user-created.event";

@EventsHandler(UserCreatedEvent)
export class UserCreatedProjection implements IEventHandler<UserCreatedEvent> {
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType
  ) {}

  async handle(event: UserCreatedEvent) {
    await this.db.insert(userReadModel).values({
      uuid: event.userUuid,
      firstName: event.firstName,
      lastName: event.lastName,
      email: event.email,
      password: event.password,
      verificationToken: event.verificationToken ?? null,
    });
  }
}
