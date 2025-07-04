import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserUpdatedEvent } from "../event/user-updated.event";
import { User } from "../user.entity";
import { VerifyEmailCommand } from "./verify-email.command";

@CommandHandler(VerifyEmailCommand)
export class VerifyEmailHandler implements ICommandHandler<VerifyEmailCommand> {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly eventBus: EventBus
  ) {}

  async execute({ token }: VerifyEmailCommand): Promise<boolean> {
    const user = await this.userRepo.findOneBy({ verificationToken: token });
    if (!user) {
      return false;
    }
    user.verificationToken = null;

    await this.userRepo.save(user);
    this.eventBus.publish(new UserUpdatedEvent(user.uuid));

    return true;
  }
}
