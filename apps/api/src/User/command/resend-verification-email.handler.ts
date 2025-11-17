import { Inject, Logger } from "@nestjs/common";
import { CommandHandler, type ICommandHandler } from "@nestjs/cqrs";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import { EmailService } from "../../Email/email.service.js";
import type { db as DbType } from "../../db/data-source.js";
import { DB_TOKEN } from "../../db/database.module.js";
import { user } from "../../db/schema/index.js";
import { ResendVerificationEmailCommand } from "./resend-verification-email.command.js";

@CommandHandler(ResendVerificationEmailCommand)
export class ResendVerificationEmailHandler
  implements ICommandHandler<ResendVerificationEmailCommand>
{
  private readonly logger = new Logger(ResendVerificationEmailHandler.name);

  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType,
    private readonly emailService: EmailService,
  ) {}

  async execute({ email }: ResendVerificationEmailCommand): Promise<boolean> {
    const [existingUser] = await this.db
      .select()
      .from(user)
      .where(eq(user.email, email));

    if (!existingUser) {
      this.logger.warn(
        `Resend verification requested for unknown email: ${email}`,
      );
      return false;
    }

    if (!existingUser.verificationToken) {
      this.logger.log(
        `Resend verification skipped; user already verified: ${email}`,
      );
      return false;
    }

    const newVerificationToken = uuidv4();

    await this.db
      .update(user)
      .set({ verificationToken: newVerificationToken, updatedAt: new Date() })
      .where(eq(user.uuid, existingUser.uuid));

    await this.emailService.sendVerificationEmail(email, newVerificationToken);
    this.logger.log(`Resent verification email to: ${email}`);

    return true;
  }
}
