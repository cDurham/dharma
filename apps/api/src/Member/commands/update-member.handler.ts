import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { DB_TOKEN } from "../../db/database.module";
import { db as DbType } from "../../db/data-source";
import { member } from "../../db/schema";
import { MemberUpdatedEvent } from "../events/member-updated.event";
import { Member } from "../member.entity";
import { UpdateMemberCommand } from "./update-member.command";

@CommandHandler(UpdateMemberCommand)
export class UpdateMemberHandler
  implements ICommandHandler<UpdateMemberCommand>
{
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType,
    private readonly eventBus: EventBus
  ) {}

  async execute({ memberUuid, data }: UpdateMemberCommand): Promise<Member> {
    // Check if member exists
    const [existingMember] = await this.db
      .select()
      .from(member)
      .where(eq(member.uuid, memberUuid));

    if (!existingMember) {
      throw new Error("Member not found");
    }

    // Update member
    await this.db
      .update(member)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(member.uuid, memberUuid));

    // Fetch updated member
    const [updatedMember] = await this.db
      .select()
      .from(member)
      .where(eq(member.uuid, memberUuid));

    this.eventBus.publish(new MemberUpdatedEvent(updatedMember.uuid));

    return updatedMember;
  }
}
