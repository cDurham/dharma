import { Inject, Injectable } from "@nestjs/common";
import { EventBus } from "@nestjs/cqrs";

import { EventStoreService } from "../EventStore/event-store.service";
import { DomainEvent } from "../EventStore/types";
import { UserAggregate } from "./user.aggregate";

@Injectable()
export class UserRepository {
  constructor(
    private readonly eventStore: EventStoreService,
    private readonly eventBus: EventBus
  ) {}

  async load(userUuid: string): Promise<UserAggregate | null> {
    const events = await this.eventStore.getEventsByAggregate(userUuid);
    if (!events || events.length === 0) return null;
    // Rehydrate aggregate from stored envelopes
    const agg = UserAggregate.fromHistory(userUuid, events);
    return agg;
  }

  async save(aggregate: UserAggregate): Promise<void> {
    const events = aggregate.getUncommittedEvents();
    for (const evt of events) {
      const domain: DomainEvent = {
        aggregateId: aggregate.uuid,
        aggregateType: aggregate.aggregateType,
        eventType: evt.constructor.name,
        payload: this.eventToPayload(evt),
        metadata: {},
      };
      await this.eventStore.appendEvent(domain);
      // Publish typed event locally for projections
      this.eventBus.publish(evt);
    }
    aggregate.markCommitted();
  }

  private eventToPayload(evt: any): any {
    // Map class instances to plain payloads for persistence
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
}

