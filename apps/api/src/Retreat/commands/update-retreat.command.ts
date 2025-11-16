import { Command } from "@nestjs/cqrs";
import type { Retreat } from "../retreat.entity.js";
import type { UpdateRetreatInput } from "../retreat.input.js";

export class UpdateRetreatCommand extends Command<Retreat | null> {
  constructor(
    public readonly retreatUuid: string,
    public readonly data: UpdateRetreatInput,
  ) {
    super();
  }
}
