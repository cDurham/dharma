export class UserPasswordChangedEvent {
  constructor(
    public readonly userUuid: string,
    public readonly newPassword: string
  ) {}
}

