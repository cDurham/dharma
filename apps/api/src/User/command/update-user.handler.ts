import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import bcrypt from "bcryptjs";

import { User } from "../user.entity";
import { UpdateUserCommand } from "./update-user.command";
import { UserRepository } from "../user-repository";
import { UserAggregate } from "../user.aggregate";

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    private readonly userRepository: UserRepository
  ) {}

  async execute({ userUuid, data }: UpdateUserCommand): Promise<User | null> {
    const aggregate = await this.userRepository.load(userUuid);
    if (!aggregate) return null;

    const updateFields: any = {};
    if (data.email !== undefined) updateFields.email = data.email;
    if (data.password !== undefined) {
      updateFields.password = await bcrypt.hash(data.password, 12);
    }
    if (Object.keys(updateFields).length > 0) {
      aggregate.update(updateFields);
      await this.userRepository.save(aggregate);
    }

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
