import { Command } from "@nestjs/cqrs";
import type { MemberEntity } from "../member.entity.js";
import type { CreateMemberInput } from "../member.input.js";

export class CreateMemberCommand extends Command<MemberEntity> {
  constructor(public readonly input: CreateMemberInput) {
    super();
  }
}
