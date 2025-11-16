import { Inject } from "@nestjs/common";
import {
  CommandHandler,
  type EventBus,
  type ICommandHandler,
} from "@nestjs/cqrs";
import { eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";

import type { db as DbType } from "../../db/data-source.js";
import { DB_TOKEN } from "../../db/database.module.js";
import { member } from "../../db/schema/index.js";
import { MemberCreatedEvent } from "../events/member-created.event.js";
import type { Member } from "../member.entity.js";
import { CreateMemberCommand } from "./create-member.command.js";

@CommandHandler(CreateMemberCommand)
export class CreateMemberHandler
  implements ICommandHandler<CreateMemberCommand>
{
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateMemberCommand): Promise<Member> {
    const { firstName, lastName } = command.input;

    const newMemberId = uuidv7();

    await this.db.insert(member).values({
      uuid: newMemberId,
      firstName,
      lastName,
      joinDate: new Date(),
    });

    // Fetch the created member
    const [savedMember] = await this.db
      .select()
      .from(member)
      .where(eq(member.uuid, newMemberId));

    this.eventBus.publish(
      new MemberCreatedEvent(savedMember.uuid, savedMember.firstName),
    );

    return savedMember;
  }
}
