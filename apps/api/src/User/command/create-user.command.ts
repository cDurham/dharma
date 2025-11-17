import { Command } from "@nestjs/cqrs";
import type { UserEntity } from "../user.entity.js";
import type { CreateUserInput } from "../user.input.js";

export class CreateUserCommand extends Command<UserEntity> {
  constructor(public readonly data: CreateUserInput) {
    super();
  }
}
