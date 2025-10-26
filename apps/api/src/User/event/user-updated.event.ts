import { UpdatableUserFields } from "../user.types";

export class UserUpdatedEvent {
  constructor(
    public readonly userUuid: string,
    public readonly changes: Partial<UpdatableUserFields>
  ) {}
}
