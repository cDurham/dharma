import { ValidateUserInput } from "../auth.input";

export class ValidateUserCommand {
  constructor(public readonly input: ValidateUserInput) {}
}
