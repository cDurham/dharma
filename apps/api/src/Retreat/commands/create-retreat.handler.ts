import { Inject } from "@nestjs/common";
import { CommandHandler, type EventBus, type ICommandHandler } from "@nestjs/cqrs";
import { eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";

import type { db as DbType } from "../../db/data-source";
import { DB_TOKEN } from "../../db/database.module";
import { retreat } from "../../db/schema";
import { RetreatCreatedEvent } from "../events/retreat-created.event";
import type { Retreat } from "../retreat.entity";
import { CreateRetreatCommand } from "./create-retreat.command";

@CommandHandler(CreateRetreatCommand)
export class CreateRetreatHandler
  implements ICommandHandler<CreateRetreatCommand>
{
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: CreateRetreatCommand): Promise<Retreat> {
    const { name, startAt, endAt } = command.input;

    const newRetreatId = uuidv7();

    await this.db.insert(retreat).values({
      uuid: newRetreatId,
      name,
      startAt,
      endAt,
    });

    // Fetch the created retreat
    const [savedRetreat] = await this.db
      .select()
      .from(retreat)
      .where(eq(retreat.uuid, newRetreatId));

    // after saving, emit an event
    this.eventBus.publish(
      new RetreatCreatedEvent(savedRetreat.uuid, savedRetreat.name)
    );

    return savedRetreat;
  }
}
