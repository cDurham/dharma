import { Command } from "@nestjs/cqrs";
import type { User } from "../../User/user.entity.js";
import type { ValidateUserInput } from "../auth.input.js";

export class ValidateUserCommand extends Command<Omit<User, "password">> {
  constructor(public readonly input: ValidateUserInput) {
    super();
  }
}
