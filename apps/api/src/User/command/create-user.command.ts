import { Command } from "@nestjs/cqrs";
import type { User } from "../user.entity.js";
import type { CreateUserInput } from "../user.input.js";

export class CreateUserCommand extends Command<User> {
  constructor(public readonly data: CreateUserInput) {
    super();
  }
}
