import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { DB_TOKEN } from "../../db/database.module";
import { db as DbType } from "../../db/data-source";
import { user } from "../../db/schema";
import { UserDeletedEvent } from "../event/user-deleted.event";
import { DeleteUserCommand } from "./delete-user.command";

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType,
    private readonly eventBus: EventBus
  ) {}

  async execute({ userUuid }: DeleteUserCommand): Promise<boolean> {
    // Fetch user before deleting
    const [userToDelete] = await this.db
      .select()
      .from(user)
      .where(eq(user.uuid, userUuid));

    if (!userToDelete) {
      throw new Error("User not found");
    }

    // Delete user
    await this.db.delete(user).where(eq(user.uuid, userUuid));

    this.eventBus.publish(new UserDeletedEvent(userToDelete.uuid));

    return true;
  }
}
