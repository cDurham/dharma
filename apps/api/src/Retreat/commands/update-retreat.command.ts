import { UpdateRetreatInput } from "../retreat.input";

export class UpdateRetreatCommand {
  constructor(
    public readonly retreatUuid: string,
    public readonly data: UpdateRetreatInput
  ) {}
}
