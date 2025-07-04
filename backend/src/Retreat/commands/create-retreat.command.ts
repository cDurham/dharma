import { CreateRetreatInput } from "../retreat.input";

export class CreateRetreatCommand {
  constructor(public readonly input: CreateRetreatInput) {}
}
