import { Command } from "@nestjs/cqrs";
import { UpdateUserInput } from "../user.input";
import { User } from "../user.entity";

export class UpdateUserCommand extends Command<User | null> {
  constructor(
    public readonly userUuid: string,
    public readonly data: UpdateUserInput
  ) {
    super();
  }
}
