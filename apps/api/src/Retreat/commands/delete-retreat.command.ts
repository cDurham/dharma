import { DeleteRetreatInput } from "../retreat.input";

export class DeleteRetreatCommand {
  constructor(public readonly input: DeleteRetreatInput) {}
}
