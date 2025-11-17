import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { authConfig } from "../config/auth.config.js";
import { EmailModule } from "../Email/email.module.js";
import { MemberModule } from "../Member/member.module.js";
import { UserModule } from "../User/user.module.js";
import { AuthResolver } from "./auth.resolver.js";
import { AuthCreateRefreshTokenHandler } from "./command/auth-create-refresh-token.handler.js";
import { AuthLoginUserHandler } from "./command/auth-login-user.handler.js";
import { AuthRefreshAccessTokenHandler } from "./command/auth-refresh-access-token.handler.js";
import { AuthRevokeRefreshTokenHandler } from "./command/auth-revoke-refresh-token.handler.js";
import { ValidateUserHandler } from "./command/auth-validate-user.handler.js";
import { JwtStrategy } from "./jwt.strategy.js";
import { JwtAuthGuard } from "./jwt-auth.guard.js";
import { TokenCleanupService } from "./token-cleanup.service.js";

@Module({
  imports: [
    CqrsModule,
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
    EmailModule,
    UserModule,
    MemberModule,
  ],
  providers: [
    AuthCreateRefreshTokenHandler,
    AuthLoginUserHandler,
    AuthRefreshAccessTokenHandler,
    AuthRevokeRefreshTokenHandler,
    AuthResolver,
    ConfigService,
    JwtAuthGuard,
    JwtStrategy,
    TokenCleanupService,
    ValidateUserHandler,
  ],
  exports: [JwtAuthGuard, JwtStrategy, PassportModule],
})
export class AuthModule {}
