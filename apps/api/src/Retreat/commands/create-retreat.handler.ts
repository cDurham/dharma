import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { v7 as uuidv7 } from "uuid";
import { eq } from "drizzle-orm";

import { DB_TOKEN } from "../../db/database.module";
import { db as DbType } from "../../db/data-source";
import { retreat } from "../../db/schema";
import { RetreatCreatedEvent } from "../events/retreat-created.event";
import { Retreat } from "../retreat.entity";
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
