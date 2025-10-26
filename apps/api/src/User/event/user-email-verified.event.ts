export class UserEmailVerifiedEvent {
  constructor(
    public readonly userUuid: string,
    public readonly verifiedAt: Date
  ) {}
}

