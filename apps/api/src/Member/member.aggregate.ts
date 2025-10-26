import { v7 as uuidv7 } from "uuid";
import { AggregateRoot } from "../BaseEntity/aggregate-root";
import { MemberState, UpdatableMemberFields } from "./member.types";
import { MemberCreatedEvent } from "./events/member-created.event";
import { MemberUpdatedEvent } from "./events/member-updated.event";
import { MemberDeletedEvent } from "./events/member-deleted.event";

export class MemberAggregate extends AggregateRoot<MemberState> {
  get aggregateType(): 'Member' {
    return "Member";
  }

  constructor(id: string) {
    super(id);
  }

  static create(params: {
    firstName: string;
    lastName: string;
    joinDate?: Date;
  }): MemberAggregate {
    const id = uuidv7();
    const agg = new MemberAggregate(id);
    const evt = new MemberCreatedEvent(
      id,
      params.firstName,
      params.lastName,
      params.joinDate ?? new Date()
    );
    agg.addEvent(evt);
    return agg;
  }

  // Rehydration centralized in AggregateRoot.fromHistory

  update(fields: Partial<UpdatableMemberFields>) {
    const evt = new MemberUpdatedEvent(this.id, fields);
    this.addEvent(evt);
  }

  delete() {
    const evt = new MemberDeletedEvent(this.id);
    this.addEvent(evt);
  }

  protected apply(event: any) {
    if (event instanceof MemberCreatedEvent) {
      this.onMemberCreated(event);
    } else if (event instanceof MemberUpdatedEvent) {
      this.onMemberUpdated(event);
    } else if (event instanceof MemberDeletedEvent) {
      this.onMemberDeleted(event);
    } else {
      switch (event.eventType) {
        case "MemberCreatedEvent":
          this.onMemberCreated(
            new MemberCreatedEvent(
              event.aggregateId,
              event.payload.firstName,
              event.payload.lastName,
              new Date(event.payload.joinDate)
            )
          );
          break;
        case "MemberUpdatedEvent":
          this.onMemberUpdated(
            new MemberUpdatedEvent(event.aggregateId, event.payload)
          );
          break;
        case "MemberDeletedEvent":
          this.onMemberDeleted(new MemberDeletedEvent(event.aggregateId));
          break;
        default:
          break;
      }
    }
  }

  private onMemberCreated(event: MemberCreatedEvent) {
    this.state = {
      uuid: this.id,
      firstName: event.firstName,
      lastName: event.lastName,
      joinDate: event.joinDate,
      userUuid: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deleted: false,
    } as MemberState;
  }

  private onMemberUpdated(event: MemberUpdatedEvent) {
    if (!this.state) return;
    this.state = {
      ...this.state,
      ...event.changes,
      updatedAt: new Date(),
    };
  }

  private onMemberDeleted(_event: MemberDeletedEvent) {
    if (!this.state) return;
    this.state = { ...this.state, deleted: true, updatedAt: new Date() };
  }
}
