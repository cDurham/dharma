import { EventBus } from "@nestjs/cqrs";

import { AggregateType, DomainEvent } from "./types";
import { EventStoreService } from "./event-store.service";

type AggregateContract = {
  uuid: string;
  aggregateType: AggregateType;
  getUncommittedEvents(): any[];
  markCommitted(): void;
};

export abstract class BaseRepository<TAgg extends AggregateContract> {
  protected constructor(
    private readonly eventStore: EventStoreService,
    private readonly eventBus: EventBus,
    private readonly rehydrate: (id: string, events: any[]) => TAgg,
    private readonly serialize: (evt: any) => any
  ) {}

  async load(id: string): Promise<TAgg | null> {
    const events = await this.eventStore.getEventsByAggregate(id);
    if (!events || events.length === 0) return null;
    return this.rehydrate(id, events);
  }

  async save(aggregate: TAgg): Promise<void> {
    const events = aggregate.getUncommittedEvents();
    for (const evt of events) {
      const domain: DomainEvent = {
        aggregateId: aggregate.uuid,
        aggregateType: aggregate.aggregateType,
        eventType: evt.constructor.name,
        payload: this.serialize(evt),
        metadata: {},
      };
      await this.eventStore.appendEvent(domain);
      this.eventBus.publish(evt);
    }
    aggregate.markCommitted();
  }
}

