import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../user.entity";
import { UpdateUserCommand } from "./update-user.command";
import { UserUpdatedEvent } from "../event/user-updated.event";

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly eventBus: EventBus
  ) {}

  async execute({ userUuid, data }: UpdateUserCommand): Promise<User | null> {
    const { email, password } = data;

    const user = await this.userRepo.findOneBy({ uuid: userUuid });

    if (!user) {
      return null;
    }

    Object.assign(user, { email, password });

    await this.userRepo.save(user);

    this.eventBus.publish(new UserUpdatedEvent(user.uuid));

    return user;
  }
}
