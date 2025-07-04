import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { EmailService } from "../../Email/email.service";
import { UserCreatedEvent } from "../event/user-created.event";
import { User } from "../user.entity";
import { CreateUserCommand } from "./create-user.command";

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private eventBus: EventBus,
    private emailService: EmailService
  ) {}

  async execute({ data }: CreateUserCommand): Promise<User> {
    const newUser = {
      ...data,
      verificationToken: uuidv4(),
    };
    const user = this.userRepo.create(newUser);
    const savedUser = await this.userRepo.save(user);

    await this.emailService.sendVerificationEmail(
      newUser.email,
      newUser.verificationToken
    );

    this.eventBus.publish(new UserCreatedEvent(savedUser.uuid));

    return savedUser;
  }
}
