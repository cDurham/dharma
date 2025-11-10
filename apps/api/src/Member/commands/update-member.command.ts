import { Command } from "@nestjs/cqrs";
import { UpdateMemberInput } from "../member.input";
import { Member } from "../member.entity";

export class UpdateMemberCommand extends Command<Member> {
  constructor(
    public readonly memberUuid: string,
    public readonly data: UpdateMemberInput
  ) {
    super();
  }
}
