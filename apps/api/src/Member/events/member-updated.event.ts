export class MemberUpdatedEvent {
  constructor(
    public readonly memberUuid: string,
    public readonly changes: Partial<{
      firstName: string;
      lastName: string;
      userUuid: string | null;
    }>
  ) {}
}
