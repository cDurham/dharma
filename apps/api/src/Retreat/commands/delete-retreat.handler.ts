import { Inject } from "@nestjs/common";
import {
  CommandHandler,
  type EventBus,
  type ICommandHandler,
} from "@nestjs/cqrs";
import { eq } from "drizzle-orm";

import type { db as DbType } from "../../db/data-source.js";
import { DB_TOKEN } from "../../db/database.module.js";
import { retreat } from "../../db/schema/index.js";
import { RetreatDeletedEvent } from "../events/retreat-deleted.event.js";
import { DeleteRetreatCommand } from "./delete-retreat.command.js";

@CommandHandler(DeleteRetreatCommand)
export class DeleteRetreatHandler
  implements ICommandHandler<DeleteRetreatCommand>
{
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeleteRetreatCommand): Promise<boolean> {
    const { uuid } = command.input;

    // Fetch retreat before deleting
    const [retreatToDelete] = await this.db
      .select()
      .from(retreat)
      .where(eq(retreat.uuid, uuid));

    if (!retreatToDelete) {
      throw new Error("Retreat not found");
    }

    // Delete retreat
    await this.db.delete(retreat).where(eq(retreat.uuid, uuid));

    this.eventBus.publish(new RetreatDeletedEvent(retreatToDelete.uuid));

    return true;
  }
}
