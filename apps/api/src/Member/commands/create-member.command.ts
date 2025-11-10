import { Command } from "@nestjs/cqrs";
import { CreateMemberInput } from "../member.input";
import { Member } from "../member.entity";

export class CreateMemberCommand extends Command<Member> {
  constructor(public readonly input: CreateMemberInput) {
    super();
  }
}
