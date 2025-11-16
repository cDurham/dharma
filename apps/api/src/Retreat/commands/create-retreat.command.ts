import { Command } from "@nestjs/cqrs";
import type { Retreat } from "../retreat.entity.js";
import type { CreateRetreatInput } from "../retreat.input.js";

export class CreateRetreatCommand extends Command<Retreat> {
  constructor(public readonly input: CreateRetreatInput) {
    super();
  }
}
