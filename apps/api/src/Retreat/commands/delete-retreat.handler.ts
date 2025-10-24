import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { RetreatDeletedEvent } from "../events/retreat-deleted.event";
import { Retreat } from "../retreat.entity";
import { DeleteRetreatCommand } from "./delete-retreat.command";

@CommandHandler(DeleteRetreatCommand)
export class DeleteRetreatHandler
  implements ICommandHandler<DeleteRetreatCommand>
{
  constructor(
    @InjectRepository(Retreat)
    private readonly retreatRepo: Repository<Retreat>,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: DeleteRetreatCommand): Promise<Retreat> {
    const { uuid } = command.input;

    const retreat = await this.retreatRepo.findOneBy({ uuid });

    if (!retreat) {
      throw new Error("Retreat not found");
    }

    await this.retreatRepo.delete(retreat);

    this.eventBus.publish(new RetreatDeletedEvent(retreat.uuid));

    return retreat;
  }
}
