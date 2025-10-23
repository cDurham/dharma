import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { v7 as uuidv7 } from "uuid";

import { RetreatCreatedEvent } from "../events/retreat-created.event";
import { Retreat } from "../retreat.entity";
import { CreateRetreatCommand } from "./create-retreat.command";

@CommandHandler(CreateRetreatCommand)
export class CreateRetreatHandler
  implements ICommandHandler<CreateRetreatCommand>
{
  constructor(
    @InjectRepository(Retreat)
    private readonly retreatRepo: Repository<Retreat>,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: CreateRetreatCommand): Promise<Retreat> {
    const { name, startAt, endAt } = command.input;

    const newRetreat = this.retreatRepo.create({
      uuid: uuidv7(),
      name,
      startAt,
      endAt,
      createdAt: new Date(),
    });

    const savedRetreat = await this.retreatRepo.save(newRetreat);

    // after saving, emit an event
    this.eventBus.publish(
      new RetreatCreatedEvent(savedRetreat.uuid, savedRetreat.name)
    );

    return savedRetreat;
  }
}
