import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

import { User } from "../user.entity";
import { CreateUserCommand } from "./create-user.command";
import { UserRepository } from "../user-repository";
import { UserAggregate } from "../user.aggregate";

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly userRepository: UserRepository
  ) {}

  async execute({ data }: CreateUserCommand): Promise<User> {
    const verificationToken = uuidv4();

    // Hash password before saving
    const password = await bcrypt.hash(data.password, 12);

    // Build aggregate and persist events
    const aggregate = UserAggregate.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password,
      verificationToken,
    });

    await this.userRepository.save(aggregate);

    const state = aggregate.getState()!;
    return {
      uuid: state.uuid,
      firstName: state.firstName,
      lastName: state.lastName,
      email: state.email,
      password: state.password,
      verificationToken: state.verificationToken ?? null,
      createdAt: state.createdAt!,
      updatedAt: state.updatedAt!,
    };
  }
}
