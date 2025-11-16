import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class EmailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendVerificationEmail(
    email: string,
    verificationToken: string,
  ): Promise<void> {
    const verificationUrl = `${this.configService.get<string>("BACKEND_URL")}/verify?token=${verificationToken}`;
    await this.mailerService.sendMail({
      from: this.configService.get<string>("EMAIL_USER"),
      to: email,
      subject: "Verify your email",
      html: `
        <p>Please click the link below to verify your email:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
      `,
    });
  }
}
