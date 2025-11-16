import { Command } from "@nestjs/cqrs";
import type { Member } from "../member.entity.js";
import type { CreateMemberInput } from "../member.input.js";

export class CreateMemberCommand extends Command<Member> {
  constructor(public readonly input: CreateMemberInput) {
    super();
  }
}
