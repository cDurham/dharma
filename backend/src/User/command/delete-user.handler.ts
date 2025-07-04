import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserDeletedEvent } from "../event/user-deleted.event";
import { User } from "../user.entity";
import { DeleteUserCommand } from "./delete-user.command";

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private readonly eventBus: EventBus
  ) {}

  async execute({ userUuid }: DeleteUserCommand) {
    const user = await this.userRepo.findOneBy({ uuid: userUuid });

    if (!user) {
      throw new Error("User not found");
    }

    await this.userRepo.delete(user.uuid);

    this.eventBus.publish(new UserDeletedEvent(user.uuid));

    return user;
  }
}
