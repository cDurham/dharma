import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { authConfig } from "../config/auth.config.js";
import { UserModule } from "../User/user.module.js";
import { AuthResolver } from "./auth.resolver.js";
import { AuthService } from "./auth.service.js";
import { JwtStrategy } from "./jwt.strategy.js";
import { JwtAuthGuard } from "./jwt-auth.guard.js";
import { TokenCleanupService } from "./token-cleanup.service.js";

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>("JWT_SECRET");
        if (!secret) {
          throw new Error(
            "JWT_SECRET environment variable is required but not set",
          );
        }
        return {
          secret,
          signOptions: { expiresIn: authConfig.accessToken.expiresIn },
        };
      },
      inject: [ConfigService],
    }),
    UserModule,
  ],
  providers: [
    AuthResolver,
    AuthService,
    JwtAuthGuard,
    JwtStrategy,
    TokenCleanupService,
  ],
  exports: [JwtAuthGuard, JwtStrategy, PassportModule],
})
export class AuthModule {}
