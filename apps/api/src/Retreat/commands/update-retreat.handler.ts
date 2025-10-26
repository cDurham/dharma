import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Retreat } from "../retreat.entity";
import { UpdateRetreatCommand } from "./update-retreat.command";
import { RetreatRepository } from "../retreat-repository";
import { filterUndefined } from "../../EventStore/utils";

@CommandHandler(UpdateRetreatCommand)
export class UpdateRetreatHandler implements ICommandHandler<UpdateRetreatCommand> {
  constructor(private readonly retreatRepository: RetreatRepository) {}

  async execute({ retreatUuid, data }: UpdateRetreatCommand): Promise<Retreat | null> {
    const aggregate = await this.retreatRepository.load(retreatUuid);
    if (!aggregate) return null;

    const changes = filterUndefined({
      name: data.name,
      startAt: data.startAt,
      endAt: data.endAt,
    });

    if (Object.keys(changes).length > 0) {
      aggregate.update(changes);
      await this.retreatRepository.save(aggregate);
    }

    const state = aggregate.getState()!;
    return {
      uuid: state.uuid,
      name: state.name,
      startAt: state.startAt,
      endAt: state.endAt,
      createdAt: state.createdAt!,
      updatedAt: state.updatedAt!,
    };
  }
}
