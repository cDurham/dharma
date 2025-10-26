import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteRetreatCommand } from "./delete-retreat.command";
import { RetreatRepository } from "../retreat-repository";

@CommandHandler(DeleteRetreatCommand)
export class DeleteRetreatHandler implements ICommandHandler<DeleteRetreatCommand> {
  constructor(private readonly retreatRepository: RetreatRepository) {}

  async execute(command: DeleteRetreatCommand): Promise<boolean> {
    const { uuid } = command.input;

    const aggregate = await this.retreatRepository.load(uuid);
    if (!aggregate) {
      throw new Error("Retreat not found");
    }

    aggregate.delete();
    await this.retreatRepository.save(aggregate);
    return true;
  }
}
