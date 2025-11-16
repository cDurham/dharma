import { Command } from "@nestjs/cqrs";
import type { User } from "../user.entity";
import type { UpdateUserInput } from "../user.input";

export class UpdateUserCommand extends Command<User | null> {
  constructor(
    public readonly userUuid: string,
    public readonly data: UpdateUserInput,
  ) {
    super();
  }
}
