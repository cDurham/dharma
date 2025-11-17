import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MailerModule as NestMailerModule } from "@nestjs-modules/mailer";

@Module({
  imports: [
    ConfigModule.forRoot(), // Ensure ConfigModule is imported and configured
    NestMailerModule.forRootAsync({
      imports: [ConfigModule], // Import ConfigModule here
      useFactory: (configService: ConfigService) => {
        const emailUser = configService.get<string>("EMAIL_USER");
        const emailPassword = configService.get<string>("EMAIL_USER_PASSWORD");

        return {
          transport: {
            host: configService.get<string>("EMAIL_HOST"),
            port: configService.get<number>("EMAIL_PORT"),
            secure: false,
            auth: {
              user: emailUser,
              pass: emailPassword,
            },
            tls: {
              rejectUnauthorized: false,
            },
          },
          defaults: {
            from: emailUser,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [NestMailerModule],
})
export class MailerModule {}
