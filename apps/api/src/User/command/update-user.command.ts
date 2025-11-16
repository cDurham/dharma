import { Command } from "@nestjs/cqrs";
import type { User } from "../user.entity.js";
import type { UpdateUserInput } from "../user.input.js";

export class UpdateUserCommand extends Command<User | null> {
  constructor(
    public readonly userUuid: string,
    public readonly data: UpdateUserInput,
  ) {
    super();
  }
}
