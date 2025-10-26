import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { DB_TOKEN } from "../../db/database.module";
import { db as DbType } from "../../db/data-source";
import { userReadModel } from "../../db/schema";
import { VerifyEmailCommand } from "./verify-email.command";
import { UserRepository } from "../user-repository";

@CommandHandler(VerifyEmailCommand)
export class VerifyEmailHandler implements ICommandHandler<VerifyEmailCommand> {
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType,
    private readonly userRepository: UserRepository
  ) {}

  async execute({ token }: VerifyEmailCommand): Promise<boolean> {
    const [row] = await this.db
      .select()
      .from(userReadModel)
      .where(eq(userReadModel.verificationToken, token));

    if (!row) return false;

    const aggregate = await this.userRepository.load(row.uuid);
    if (!aggregate) return false;

    aggregate.verifyEmail();
    await this.userRepository.save(aggregate);

    return true;
  }
}
