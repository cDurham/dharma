import { Command } from "@nestjs/cqrs";
import type { Retreat } from "../retreat.entity";
import type { UpdateRetreatInput } from "../retreat.input";

export class UpdateRetreatCommand extends Command<Retreat | null> {
  constructor(
    public readonly retreatUuid: string,
    public readonly data: UpdateRetreatInput,
  ) {
    super();
  }
}
