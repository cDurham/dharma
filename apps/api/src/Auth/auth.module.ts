import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { JwtModule } from "@nestjs/jwt";
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
import { RefreshToken } from "./refresh-token.entity";
import { authConfig } from "../config/auth.config";

@Module({
  imports: [
    CqrsModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET") || "your-secret-key",
        signOptions: { expiresIn: authConfig.accessToken.expiresIn },
      }),
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
    ValidateUserHandler,
  ],
})
export class AuthModule {}
