import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { appConfig } from "../config/app.config.js";
import { UserModule } from "../User/user.module.js";
import { AuthResolver } from "./auth.resolver.js";
import { AuthService } from "./auth.service.js";
import { JwtStrategy } from "./jwt.strategy.js";
import { JwtAuthGuard } from "./jwt-auth.guard.js";
import { TokenCleanupService } from "./token-cleanup.service.js";

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: appConfig.jwtSecret,
      signOptions: { expiresIn: appConfig.accessToken.expiresIn },
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
