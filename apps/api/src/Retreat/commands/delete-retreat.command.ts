import { Command } from "@nestjs/cqrs";
import type { DeleteRetreatInput } from "../retreat.input";

export class DeleteRetreatCommand extends Command<boolean> {
  constructor(public readonly input: DeleteRetreatInput) {
    super();
  }
}
