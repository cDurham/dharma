import { Command } from "@nestjs/cqrs";
import type { UserEntity } from "../../User/user.entity.js";
import type { ValidateUserInput } from "../auth.input.js";

export class ValidateUserCommand extends Command<
  Omit<UserEntity, "password">
> {
  constructor(public readonly input: ValidateUserInput) {
    super();
  }
}
