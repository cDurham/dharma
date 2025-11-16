import { Inject } from "@nestjs/common";
import { CommandHandler, type EventBus, type ICommandHandler } from "@nestjs/cqrs";
import { eq } from "drizzle-orm";

import type { db as DbType } from "../../db/data-source";
import { DB_TOKEN } from "../../db/database.module";
import { user } from "../../db/schema";
import { UserUpdatedEvent } from "../event/user-updated.event";
import { VerifyEmailCommand } from "./verify-email.command";

@CommandHandler(VerifyEmailCommand)
export class VerifyEmailHandler implements ICommandHandler<VerifyEmailCommand> {
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType,
    private readonly eventBus: EventBus
  ) {}

  async execute({ token }: VerifyEmailCommand): Promise<boolean> {
    const [userToVerify] = await this.db
      .select()
      .from(user)
      .where(eq(user.verificationToken, token));

    if (!userToVerify) {
      return false;
    }

    // Set verification token to null
    await this.db
      .update(user)
      .set({ verificationToken: null, updatedAt: new Date() })
      .where(eq(user.uuid, userToVerify.uuid));

    this.eventBus.publish(new UserUpdatedEvent(userToVerify.uuid));

    return true;
  }
}
