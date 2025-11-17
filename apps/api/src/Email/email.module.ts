import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MailerModule } from "../Mailer/mailer.module.js";
import { EmailService } from "./email.service.js";

@Module({
  imports: [MailerModule, ConfigModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
