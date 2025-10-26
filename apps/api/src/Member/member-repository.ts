import { Injectable } from "@nestjs/common";
import { EventBus } from "@nestjs/cqrs";

import { EventStoreService } from "../EventStore/event-store.service";
import { BaseRepository } from "../EventStore/base-repository";
import { MemberAggregate } from "./member.aggregate";

@Injectable()
export class MemberRepository extends BaseRepository<MemberAggregate> {
  constructor(
    eventStore: EventStoreService,
    eventBus: EventBus
  ) {
    super(
      eventStore,
      eventBus,
      (id, events) => MemberAggregate.fromHistory(id, events),
      (evt) => {
        switch (evt.constructor.name) {
          case "MemberCreatedEvent":
            return {
              firstName: evt.firstName,
              lastName: evt.lastName,
              joinDate: evt.joinDate.toISOString(),
            };
          case "MemberUpdatedEvent":
            return { ...evt.changes };
          case "MemberDeletedEvent":
            return {};
          default:
            return evt;
        }
      }
    );
  }
}
