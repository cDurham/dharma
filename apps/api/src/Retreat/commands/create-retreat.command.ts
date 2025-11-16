import { Command } from "@nestjs/cqrs";
import type { Retreat } from "../retreat.entity";
import type { CreateRetreatInput } from "../retreat.input";

export class CreateRetreatCommand extends Command<Retreat> {
  constructor(public readonly input: CreateRetreatInput) {
    super();
  }
}
