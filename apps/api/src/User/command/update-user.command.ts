import { UpdateUserInput } from "../user.input";

export class UpdateUserCommand {
  constructor(
    public readonly userUuid: string,
    public readonly data: UpdateUserInput
  ) {}
}
