import { Command } from "@nestjs/cqrs";
import { ValidateUserInput } from "../auth.input";
import { User } from "../../User/user.entity";

export class ValidateUserCommand extends Command<Omit<User, 'password'>> {
  constructor(public readonly input: ValidateUserInput) {
    super();
  }
}
