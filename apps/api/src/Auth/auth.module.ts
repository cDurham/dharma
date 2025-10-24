import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmailModule } from "../Email/email.module";
import { MemberModule } from "../Member/member.module";
import { UserModule } from "../User/user.module";
import { AuthResolver } from "./auth.resolver";
import { AuthCreateRefreshTokenHandler } from "./command/auth-create-refresh-token.handler";
import { AuthLoginUserHandler } from "./command/auth-login-user.handler";
import { AuthRefreshAccessTokenHandler } from "./command/auth-refresh-access-token.handler";
import { AuthRevokeRefreshTokenHandler } from "./command/auth-revoke-refresh-token.handler";
import { ValidateUserHandler } from "./command/auth-validate-user.handler";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { JwtStrategy } from "./jwt.strategy";
import { RefreshToken } from "./refresh-token.entity";
import { TokenCleanupService } from "./token-cleanup.service";
import { authConfig } from "../config/auth.config";

@Module({
  imports: [
    CqrsModule,
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>("JWT_SECRET");
        if (!secret) {
          throw new Error(
            "JWT_SECRET environment variable is required but not set"
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
    TypeOrmModule.forFeature([RefreshToken]),
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
