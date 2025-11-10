import { Command } from "@nestjs/cqrs";
import { CreateRetreatInput } from "../retreat.input";
import { Retreat } from "../retreat.entity";

export class CreateRetreatCommand extends Command<Retreat> {
  constructor(public readonly input: CreateRetreatInput) {
    super();
  }
}
