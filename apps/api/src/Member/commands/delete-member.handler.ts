import { Inject } from "@nestjs/common";
import { CommandHandler, type EventBus, type ICommandHandler } from "@nestjs/cqrs";
import { eq } from "drizzle-orm";

import type { db as DbType } from "../../db/data-source";
import { DB_TOKEN } from "../../db/database.module";
import { member } from "../../db/schema";
import { MemberDeletedEvent } from "../events/member-deleted.event";
import type { Member } from "../member.entity";
import { DeleteMemberCommand } from "./delete-member.command";

@CommandHandler(DeleteMemberCommand)
export class DeleteMemberHandler
  implements ICommandHandler<DeleteMemberCommand>
{
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType,
    private readonly eventBus: EventBus
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
