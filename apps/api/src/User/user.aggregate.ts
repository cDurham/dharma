import { v7 as uuidv7 } from "uuid";
import { AggregateRoot } from "../BaseEntity/aggregate-root";
import { UserState, UpdatableUserFields } from "./user.types";
import { UserCreatedEvent } from "./event/user-created.event";
import { UserUpdatedEvent } from "./event/user-updated.event";
import { UserDeletedEvent } from "./event/user-deleted.event";
import { UserEmailVerifiedEvent } from "./event/user-email-verified.event";
import { UserPasswordChangedEvent } from "./event/user-password-changed.event";
import { UserEmailChangedEvent } from "./event/user-email-changed.event";

export class UserAggregate extends AggregateRoot<UserState> {
  get aggregateType(): 'User' {
    return "User";
  }

  constructor(id: string) {
    super(id);
  }

  static create(params: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    verificationToken: string | null;
  }): UserAggregate {
    const id = uuidv7();
    const agg = new UserAggregate(id);
    const evt = new UserCreatedEvent(
      id,
      params.firstName,
      params.lastName,
      params.email,
      params.password,
      params.verificationToken
    );
    agg.addEvent(evt);
    return agg;
  }

  // Rehydration centralized in AggregateRoot.fromHistory

  update(fields: Partial<UpdatableUserFields>) {
    const evt = new UserUpdatedEvent(this.id, fields);
    this.addEvent(evt);
  }

  changePassword(newPassword: string) {
    const evt = new UserPasswordChangedEvent(this.id, newPassword);
    this.addEvent(evt);
  }

  changeEmail(newEmail: string, verificationToken: string) {
    const evt = new UserEmailChangedEvent(this.id, newEmail, verificationToken);
    this.addEvent(evt);
  }

  verifyEmail() {
    const evt = new UserEmailVerifiedEvent(this.id, new Date());
    this.addEvent(evt);
  }

  delete() {
    const evt = new UserDeletedEvent(this.id);
    this.addEvent(evt);
  }

  protected apply(event: any) {
    if (event instanceof UserCreatedEvent) {
      this.onUserCreated(event);
    } else if (event instanceof UserUpdatedEvent) {
      this.onUserUpdated(event);
    } else if (event instanceof UserPasswordChangedEvent) {
      this.onUserPasswordChanged(event);
    } else if (event instanceof UserEmailChangedEvent) {
      this.onUserEmailChanged(event);
    } else if (event instanceof UserEmailVerifiedEvent) {
      this.onUserEmailVerified(event);
    } else if (event instanceof UserDeletedEvent) {
      this.onUserDeleted(event);
    } else {
      // support rehydration from plain objects
      switch (event.eventType) {
        case "UserCreatedEvent":
          this.onUserCreated(
            new UserCreatedEvent(
              event.aggregateId,
              event.payload.firstName,
              event.payload.lastName,
              event.payload.email,
              event.payload.password,
              event.payload.verificationToken ?? null
            )
          );
          break;
        case "UserUpdatedEvent":
          this.onUserUpdated(
            new UserUpdatedEvent(event.aggregateId, event.payload)
          );
          break;
        case "UserPasswordChangedEvent":
          this.onUserPasswordChanged(
            new UserPasswordChangedEvent(event.aggregateId, event.payload.newPassword)
          );
          break;
        case "UserEmailChangedEvent":
          this.onUserEmailChanged(
            new UserEmailChangedEvent(
              event.aggregateId,
              event.payload.newEmail,
              event.payload.verificationToken
            )
          );
          break;
        case "UserEmailVerifiedEvent":
          this.onUserEmailVerified(
            new UserEmailVerifiedEvent(event.aggregateId, new Date(event.payload.verifiedAt))
          );
          break;
        case "UserDeletedEvent":
          this.onUserDeleted(new UserDeletedEvent(event.aggregateId));
          break;
        default:
          break;
      }
    }
  }

  private onUserCreated(event: UserCreatedEvent) {
    this.state = {
      uuid: this.id,
      firstName: event.firstName,
      lastName: event.lastName,
      email: event.email,
      password: event.password,
      verificationToken: event.verificationToken ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deleted: false,
    };
  }

  private onUserUpdated(event: UserUpdatedEvent) {
    if (!this.state) return;
    this.state = {
      ...this.state,
      ...event.changes,
      updatedAt: new Date(),
    };
  }

  private onUserPasswordChanged(event: UserPasswordChangedEvent) {
    if (!this.state) return;
    this.state = {
      ...this.state,
      password: event.newPassword,
      updatedAt: new Date(),
    };
  }

  private onUserEmailChanged(event: UserEmailChangedEvent) {
    if (!this.state) return;
    this.state = {
      ...this.state,
      email: event.newEmail,
      verificationToken: event.verificationToken,
      updatedAt: new Date(),
    };
  }

  private onUserEmailVerified(_event: UserEmailVerifiedEvent) {
    if (!this.state) return;
    this.state = { ...this.state, verificationToken: null, updatedAt: new Date() };
  }

  private onUserDeleted(_event: UserDeletedEvent) {
    if (!this.state) return;
    this.state = { ...this.state, deleted: true, updatedAt: new Date() };
  }
}
