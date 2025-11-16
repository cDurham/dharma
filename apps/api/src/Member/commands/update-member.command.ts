import { Command } from "@nestjs/cqrs";
import type { Member } from "../member.entity";
import type { UpdateMemberInput } from "../member.input";

export class UpdateMemberCommand extends Command<Member> {
  constructor(
    public readonly memberUuid: string,
    public readonly data: UpdateMemberInput,
  ) {
    super();
  }
}
