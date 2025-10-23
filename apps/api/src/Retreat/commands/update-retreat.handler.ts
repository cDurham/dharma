import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RetreatUpdatedEvent } from "../events/retreat-updated.event";
import { Retreat } from "../retreat.entity";
import { UpdateRetreatCommand } from "./update-retreat.command";

@CommandHandler(UpdateRetreatCommand)
export class UpdateRetreatHandler
  implements ICommandHandler<UpdateRetreatCommand>
{
  constructor(
    @InjectRepository(Retreat)
    private readonly retreatRepo: Repository<Retreat>,
    private readonly eventBus: EventBus
  ) {}

  async execute({
    retreatUuid,
    data,
  }: UpdateRetreatCommand): Promise<Retreat | null> {
    const { name, startAt, endAt } = data;

    const retreat = await this.retreatRepo.findOneBy({ uuid: retreatUuid });

    if (!retreat) {
      return null;
    }

    Object.assign(retreat, { name, startAt, endAt });

    await this.retreatRepo.save(retreat);

    this.eventBus.publish(new RetreatUpdatedEvent(retreat.uuid));

    return retreat;
  }
}
