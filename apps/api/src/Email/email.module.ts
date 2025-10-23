import { Module } from "@nestjs/common";
import { EmailService } from "./email.service";
import { ConfigModule } from "@nestjs/config";
import { MailerModule } from "../Mailer/mailer.module";

@Module({
  imports: [MailerModule, ConfigModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
