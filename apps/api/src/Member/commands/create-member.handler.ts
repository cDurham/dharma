import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { v7 as uuidv7 } from "uuid";
import { eq } from "drizzle-orm";

import { DB_TOKEN } from "../../db/database.module";
import { db as DbType } from "../../db/data-source";
import { member } from "../../db/schema";
import { MemberCreatedEvent } from "../events/member-created.event";
import { Member } from "../member.entity";
import { CreateMemberCommand } from "./create-member.command";

@CommandHandler(CreateMemberCommand)
export class CreateMemberHandler
  implements ICommandHandler<CreateMemberCommand>
{
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType,
    private readonly eventBus: EventBus
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
      new MemberCreatedEvent(savedMember.uuid, savedMember.firstName)
    );

    return savedMember;
  }
}
