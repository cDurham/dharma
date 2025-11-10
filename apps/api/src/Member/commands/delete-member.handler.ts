import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { DB_TOKEN } from "../../db/database.module";
import { db as DbType } from "../../db/data-source";
import { member } from "../../db/schema";
import { DeleteMemberCommand } from "./delete-member.command";
import { Member } from "../member.entity";
import { MemberDeletedEvent } from "../events/member-deleted.event";

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
