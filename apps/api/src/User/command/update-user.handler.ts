import { Inject } from "@nestjs/common";
import { CommandHandler, EventBus, type ICommandHandler } from "@nestjs/cqrs";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import type { db as DbType } from "../../db/data-source.js";
import { DB_TOKEN } from "../../db/database.module.js";
import { user } from "../../db/schema/index.js";
import { UserUpdatedEvent } from "../event/user-updated.event.js";
import type { User } from "../user.entity.js";
import type { UpdateUserData } from "../user.schema.js";
import { UpdateUserCommand } from "./update-user.command.js";

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ userUuid, data }: UpdateUserCommand): Promise<User | null> {
    const { email, password } = data;

    // Check if user exists
    const [existingUser] = await this.db
      .select()
      .from(user)
      .where(eq(user.uuid, userUuid));

    if (!existingUser) {
      return null;
    }

    // Build update data with password hashing
    const updateData: UpdateUserData = {};
    if (email !== undefined) updateData.email = email;
    if (password !== undefined) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    await this.db
      .update(user)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(user.uuid, userUuid));

    // Fetch updated user
    const [updatedUser] = await this.db
      .select()
      .from(user)
      .where(eq(user.uuid, userUuid));

    this.eventBus.publish(new UserUpdatedEvent(updatedUser.uuid));

    return updatedUser;
  }
}
