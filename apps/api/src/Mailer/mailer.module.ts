import { MailerModule as NestMailerModule } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot(), // Ensure ConfigModule is imported and configured
    NestMailerModule.forRootAsync({
      imports: [ConfigModule], // Import ConfigModule here
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>("EMAIL_HOST"),
          port: configService.get<number>("EMAIL_PORT"),
          secure: false,
          auth: {
            user: configService.get<string>("EMAIL_USER"),
            pass: configService.get<string>("EMAIL_PASSWORD"),
          },
          tls: {
            rejectUnauthorized: false,
          },
        },
        defaults: {
          from: configService.get<string>("EMAIL_USER"),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [NestMailerModule],
})
export class MailerModule {}
