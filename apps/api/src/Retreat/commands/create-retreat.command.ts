import { Command } from "@nestjs/cqrs";
import type { RetreatEntity } from "../retreat.entity.js";
import type { CreateRetreatInput } from "../retreat.input.js";

export class CreateRetreatCommand extends Command<RetreatEntity> {
  constructor(public readonly input: CreateRetreatInput) {
    super();
  }
}
