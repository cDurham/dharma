import { Command } from "@nestjs/cqrs";
import type { User } from "../user.entity";
import type { CreateUserInput } from "../user.input";

export class CreateUserCommand extends Command<User> {
  constructor(public readonly data: CreateUserInput) {
    super();
  }
}
