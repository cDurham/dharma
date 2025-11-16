import { Command } from "@nestjs/cqrs";
import type { User } from "../../User/user.entity";
import type { ValidateUserInput } from "../auth.input";

export class ValidateUserCommand extends Command<Omit<User, "password">> {
  constructor(public readonly input: ValidateUserInput) {
    super();
  }
}
