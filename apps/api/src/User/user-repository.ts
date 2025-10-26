import { Injectable } from "@nestjs/common";
import { EventBus } from "@nestjs/cqrs";

import { EventStoreService } from "../EventStore/event-store.service";
import { BaseRepository } from "../EventStore/base-repository";
import { UserAggregate } from "./user.aggregate";

@Injectable()
export class UserRepository extends BaseRepository<UserAggregate> {
  constructor(
    eventStore: EventStoreService,
    eventBus: EventBus
  ) {
    super(
      eventStore,
      eventBus,
      (id, events) => UserAggregate.fromHistory(id, events),
      (evt) => {
        switch (evt.constructor.name) {
          case "UserCreatedEvent":
            return {
              firstName: evt.firstName,
              lastName: evt.lastName,
              email: evt.email,
              password: evt.password,
              verificationToken: evt.verificationToken ?? null,
            };
          case "UserUpdatedEvent":
            return { ...evt.changes };
          case "UserPasswordChangedEvent":
            return { newPassword: evt.newPassword };
          case "UserEmailChangedEvent":
            return {
              newEmail: evt.newEmail,
              verificationToken: evt.verificationToken,
            };
          case "UserEmailVerifiedEvent":
            return { verifiedAt: evt.verifiedAt.toISOString() };
          case "UserDeletedEvent":
            return {};
          default:
            return evt;
        }
      }
    );
  }
}
