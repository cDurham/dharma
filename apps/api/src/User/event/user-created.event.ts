export class UserCreatedEvent {
  constructor(
    public readonly userUuid: string,
    public readonly email: string,
    public readonly verificationToken: string,
    public readonly firstName: string,
  ) {}
}
