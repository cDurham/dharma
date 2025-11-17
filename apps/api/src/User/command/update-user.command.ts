import { Command } from "@nestjs/cqrs";
import type { UserEntity } from "../user.entity.js";
import type { UpdateUserInput } from "../user.input.js";

export class UpdateUserCommand extends Command<UserEntity | null> {
  constructor(
    public readonly userUuid: string,
    public readonly data: UpdateUserInput,
  ) {
    super();
  }
}
