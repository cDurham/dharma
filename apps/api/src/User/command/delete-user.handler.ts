import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";

import { DeleteUserCommand } from "./delete-user.command";
import { UserRepository } from "../user-repository";

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(
    private readonly userRepository: UserRepository
  ) {}

  async execute({ userUuid }: DeleteUserCommand): Promise<boolean> {
    const aggregate = await this.userRepository.load(userUuid);
    if (!aggregate) {
      throw new Error("User not found");
    }
    aggregate.delete();
    await this.userRepository.save(aggregate);
    return true;
  }
}
