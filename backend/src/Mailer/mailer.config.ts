import { registerAs } from "@nestjs/config";

export const MailerConfig = registerAs("mailer", () => ({
  email: process.env.EMAIL_USER,
  password: process.env.EMAIL_USER_PASSWORD,
}));
