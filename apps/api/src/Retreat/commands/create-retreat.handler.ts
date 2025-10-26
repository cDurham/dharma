import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Retreat } from "../retreat.entity";
import { CreateRetreatCommand } from "./create-retreat.command";
import { RetreatAggregate } from "../retreat.aggregate";
import { RetreatRepository } from "../retreat-repository";

@CommandHandler(CreateRetreatCommand)
export class CreateRetreatHandler implements ICommandHandler<CreateRetreatCommand> {
  constructor(private readonly retreatRepository: RetreatRepository) {}

  async execute(command: CreateRetreatCommand): Promise<Retreat> {
    const { name, startAt, endAt } = command.input;

    const aggregate = RetreatAggregate.create({ name, startAt, endAt });
    await this.retreatRepository.save(aggregate);

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
