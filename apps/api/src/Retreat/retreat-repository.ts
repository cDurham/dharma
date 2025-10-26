import { Injectable } from "@nestjs/common";
import { EventBus } from "@nestjs/cqrs";

import { EventStoreService } from "../EventStore/event-store.service";
import { BaseRepository } from "../EventStore/base-repository";
import { RetreatAggregate } from "./retreat.aggregate";

@Injectable()
export class RetreatRepository extends BaseRepository<RetreatAggregate> {
  constructor(
    eventStore: EventStoreService,
    eventBus: EventBus
  ) {
    super(
      eventStore,
      eventBus,
      (id, events) => RetreatAggregate.fromHistory(id, events),
      (evt) => {
        switch (evt.constructor.name) {
          case "RetreatCreatedEvent":
            return {
              name: evt.name,
              startAt: evt.startAt.toISOString(),
              endAt: evt.endAt.toISOString(),
            };
          case "RetreatUpdatedEvent":
            return { ...evt.changes };
          case "RetreatDeletedEvent":
            return {};
          default:
            return evt;
        }
      }
    );
  }
}

