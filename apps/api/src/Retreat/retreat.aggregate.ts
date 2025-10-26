import { v7 as uuidv7 } from "uuid";
import { AggregateRoot } from "../BaseEntity/aggregate-root";
import { RetreatState, UpdatableRetreatFields } from "./retreat.types";
import { RetreatCreatedEvent } from "./events/retreat-created.event";
import { RetreatUpdatedEvent } from "./events/retreat-updated.event";
import { RetreatDeletedEvent } from "./events/retreat-deleted.event";

export class RetreatAggregate extends AggregateRoot<RetreatState> {
  get aggregateType(): 'Retreat' {
    return "Retreat";
  }

  constructor(id: string) {
    super(id);
  }

  static create(params: {
    name: string;
    startAt: Date;
    endAt: Date;
  }): RetreatAggregate {
    const id = uuidv7();
    const agg = new RetreatAggregate(id);
    const evt = new RetreatCreatedEvent(
      id,
      params.name,
      params.startAt,
      params.endAt
    );
    agg.addEvent(evt);
    return agg;
  }

  update(fields: Partial<UpdatableRetreatFields>) {
    const evt = new RetreatUpdatedEvent(this.id, fields);
    this.addEvent(evt);
  }

  delete() {
    const evt = new RetreatDeletedEvent(this.id);
    this.addEvent(evt);
  }

  protected apply(event: any) {
    if (event instanceof RetreatCreatedEvent) {
      this.onRetreatCreated(event);
    } else if (event instanceof RetreatUpdatedEvent) {
      this.onRetreatUpdated(event);
    } else if (event instanceof RetreatDeletedEvent) {
      this.onRetreatDeleted(event);
    } else {
      // support rehydration from plain objects
      switch (event.eventType) {
        case "RetreatCreatedEvent":
          this.onRetreatCreated(
            new RetreatCreatedEvent(
              event.aggregateId,
              event.payload.name,
              new Date(event.payload.startAt),
              new Date(event.payload.endAt)
            )
          );
          break;
        case "RetreatUpdatedEvent":
          this.onRetreatUpdated(
            new RetreatUpdatedEvent(event.aggregateId, event.payload)
          );
          break;
        case "RetreatDeletedEvent":
          this.onRetreatDeleted(new RetreatDeletedEvent(event.aggregateId));
          break;
        default:
          break;
      }
    }
  }

  private onRetreatCreated(event: RetreatCreatedEvent) {
    this.state = {
      uuid: this.id,
      name: event.name,
      startAt: event.startAt,
      endAt: event.endAt,
      createdAt: new Date(),
      updatedAt: new Date(),
      deleted: false,
    } as RetreatState;
  }

  private onRetreatUpdated(event: RetreatUpdatedEvent) {
    if (!this.state) return;
    this.state = {
      ...this.state,
      ...event.changes,
      updatedAt: new Date(),
    } as RetreatState;
  }

  private onRetreatDeleted(_event: RetreatDeletedEvent) {
    if (!this.state) return;
    this.state = { ...this.state, deleted: true, updatedAt: new Date() } as RetreatState;
  }
}

