export class RetreatCreatedEvent {
  constructor(
    public readonly retreatUuid: string,
    public readonly name: string,
  ) {}
}
