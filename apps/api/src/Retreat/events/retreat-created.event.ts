export class RetreatCreatedEvent {
  constructor(
    public readonly retreatUuid: string,
    public readonly name: string,
    public readonly startAt: Date,
    public readonly endAt: Date
  ) {}
}
