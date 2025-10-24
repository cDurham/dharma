import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { DB_TOKEN } from "../../db/database.module";
import { db as DbType } from "../../db/data-source";
import { retreat } from "../../db/schema";
import { RetreatUpdatedEvent } from "../events/retreat-updated.event";
import { Retreat } from "../retreat.entity";
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
    const { name, startAt, endAt } = data;

    // Check if retreat exists
    const [existingRetreat] = await this.db
      .select()
      .from(retreat)
      .where(eq(retreat.uuid, retreatUuid));

    if (!existingRetreat) {
      return null;
    }

    // Update retreat
    await this.db
      .update(retreat)
      .set({ name, startAt, endAt, updatedAt: new Date() })
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
