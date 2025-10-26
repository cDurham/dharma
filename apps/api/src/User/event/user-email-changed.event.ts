export class UserEmailChangedEvent {
  constructor(
    public readonly userUuid: string,
    public readonly newEmail: string,
    public readonly verificationToken: string
  ) {}
}

