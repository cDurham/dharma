import { Inject } from "@nestjs/common";
import { CommandHandler, type EventBus, type ICommandHandler } from "@nestjs/cqrs";
import { eq } from "drizzle-orm";

import type { db as DbType } from "../../db/data-source";
import { DB_TOKEN } from "../../db/database.module";
import { retreat } from "../../db/schema";
import { RetreatUpdatedEvent } from "../events/retreat-updated.event";
import type { Retreat } from "../retreat.entity";
import type { UpdateRetreatData } from "../retreat.schema";
import { UpdateRetreatCommand } from "./update-retreat.command";

@CommandHandler(UpdateRetreatCommand)
export class UpdateRetreatHandler
  implements ICommandHandler<UpdateRetreatCommand>
{
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType,
    private readonly eventBus: EventBus
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
