import { CreateUserInput } from "../user.input";

export class CreateUserCommand {
  constructor(public readonly data: CreateUserInput) {}
}
