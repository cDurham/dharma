export class MemberCreatedEvent {
  constructor(
    public readonly memberUuid: string,
    public readonly firstName: string
  ) {}
}
