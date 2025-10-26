import { UserReadModelRow } from "../user.types";

export class UserCreatedEvent {
  constructor(
    public readonly userUuid: string,
    public readonly firstName: UserReadModelRow['firstName'],
    public readonly lastName: UserReadModelRow['lastName'],
    public readonly email: UserReadModelRow['email'],
    public readonly password: UserReadModelRow['password'],
    public readonly verificationToken: UserReadModelRow['verificationToken']
  ) {}
}
