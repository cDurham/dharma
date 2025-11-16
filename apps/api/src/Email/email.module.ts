import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MailerModule } from "../Mailer/mailer.module";
import { EmailService } from "./email.service";

@Module({
  imports: [MailerModule, ConfigModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
