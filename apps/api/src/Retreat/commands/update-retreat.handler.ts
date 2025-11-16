import { Inject } from "@nestjs/common";
import { CommandHandler, EventBus, type ICommandHandler } from "@nestjs/cqrs";
import { eq } from "drizzle-orm";

import type { db as DbType } from "../../db/data-source.js";
import { DB_TOKEN } from "../../db/database.module.js";
import { retreat } from "../../db/schema/index.js";
import { RetreatUpdatedEvent } from "../events/retreat-updated.event.js";
import type { Retreat } from "../retreat.entity.js";
import type { UpdateRetreatData } from "../retreat.schema.js";
import { UpdateRetreatCommand } from "./update-retreat.command.js";

@CommandHandler(UpdateRetreatCommand)
export class UpdateRetreatHandler
  implements ICommandHandler<UpdateRetreatCommand>
{
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType,
    private readonly eventBus: EventBus,
  ) {}

  async execute({
    retreatUuid,
    data,
  }: UpdateRetreatCommand): Promise<Retreat | null> {
    // Check if retreat exists
    const [existingRetreat] = await this.db
      .select()
      .from(retreat)
      .where(eq(retreat.uuid, retreatUuid));

    if (!existingRetreat) {
      return null;
    }

    const updateData: UpdateRetreatData = data;

    await this.db
      .update(retreat)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(retreat.uuid, retreatUuid));

    // Fetch updated retreat
    const [updatedRetreat] = await this.db
      .select()
      .from(retreat)
      .where(eq(retreat.uuid, retreatUuid));

    this.eventBus.publish(new RetreatUpdatedEvent(updatedRetreat.uuid));

    return updatedRetreat;
  }
}
