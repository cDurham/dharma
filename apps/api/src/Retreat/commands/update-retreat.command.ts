import { Command } from "@nestjs/cqrs";
import { UpdateRetreatInput } from "../retreat.input";
import { Retreat } from "../retreat.entity";

export class UpdateRetreatCommand extends Command<Retreat | null> {
  constructor(
    public readonly retreatUuid: string,
    public readonly data: UpdateRetreatInput
  ) {
    super();
  }
}
