export class MemberCreatedEvent {
  constructor(
    public readonly memberUuid: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly joinDate: Date
  ) {}
}
