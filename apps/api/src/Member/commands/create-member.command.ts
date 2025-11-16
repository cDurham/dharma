import { Command } from "@nestjs/cqrs";
import type { Member } from "../member.entity";
import type { CreateMemberInput } from "../member.input";

export class CreateMemberCommand extends Command<Member> {
  constructor(public readonly input: CreateMemberInput) {
    super();
  }
}
