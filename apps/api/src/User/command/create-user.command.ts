import { Command } from "@nestjs/cqrs";
import { CreateUserInput } from "../user.input";
import { User } from "../user.entity";

export class CreateUserCommand extends Command<User> {
  constructor(public readonly data: CreateUserInput) {
    super();
  }
}
