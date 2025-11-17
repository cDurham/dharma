import { Command } from "@nestjs/cqrs";
import type { MemberEntity } from "../member.entity.js";

export class DeleteMemberCommand extends Command<MemberEntity> {
  constructor(public readonly memberUuid: string) {
    super();
  }
}
