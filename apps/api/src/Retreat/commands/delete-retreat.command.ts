import { Command } from "@nestjs/cqrs";
import type { DeleteRetreatInput } from "../retreat.input.js";

export class DeleteRetreatCommand extends Command<boolean> {
  constructor(public readonly input: DeleteRetreatInput) {
    super();
  }
}
