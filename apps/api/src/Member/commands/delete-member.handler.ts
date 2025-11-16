import { Inject } from "@nestjs/common";
import { CommandHandler, EventBus, type ICommandHandler } from "@nestjs/cqrs";
import { eq } from "drizzle-orm";

import type { db as DbType } from "../../db/data-source.js";
import { DB_TOKEN } from "../../db/database.module.js";
import { member } from "../../db/schema/index.js";
import { MemberDeletedEvent } from "../events/member-deleted.event.js";
import type { Member } from "../member.entity.js";
import { DeleteMemberCommand } from "./delete-member.command.js";

@CommandHandler(DeleteMemberCommand)
export class DeleteMemberHandler
  implements ICommandHandler<DeleteMemberCommand>
{
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ memberUuid }: DeleteMemberCommand): Promise<Member> {
    // Fetch member before deleting
    const [memberToDelete] = await this.db
      .select()
      .from(member)
      .where(eq(member.uuid, memberUuid));

    if (!memberToDelete) {
      throw new Error("Member not found");
    }

    // Delete member
    await this.db.delete(member).where(eq(member.uuid, memberUuid));

    this.eventBus.publish(new MemberDeletedEvent(memberToDelete.uuid));

    return memberToDelete;
  }
}
