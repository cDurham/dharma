import { Command } from "@nestjs/cqrs";
import type { Member } from "../member.entity";

export class DeleteMemberCommand extends Command<Member> {
  constructor(public readonly memberUuid: string) {
    super();
  }
}
