import { Inject } from "@nestjs/common";
import { CommandHandler, type EventBus, type ICommandHandler } from "@nestjs/cqrs";
import { eq } from "drizzle-orm";

import type { db as DbType } from "../../db/data-source";
import { DB_TOKEN } from "../../db/database.module";
import { member } from "../../db/schema";
import { MemberUpdatedEvent } from "../events/member-updated.event";
import type { Member } from "../member.entity";
import type { UpdateMemberData } from "../member.schema";
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

    const updateData: UpdateMemberData = data;

    await this.db
      .update(member)
      .set({ ...updateData, updatedAt: new Date() })
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
