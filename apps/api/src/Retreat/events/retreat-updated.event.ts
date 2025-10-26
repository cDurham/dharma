import { UpdatableRetreatFields } from "../retreat.types";

export class RetreatUpdatedEvent {
  constructor(
    public readonly retreatUuid: string,
    public readonly changes: Partial<UpdatableRetreatFields>
  ) {}
}
