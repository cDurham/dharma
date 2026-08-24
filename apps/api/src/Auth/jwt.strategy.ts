import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import type { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { appConfig } from "../config/app.config.js";
import type { AuthenticatedUser } from "../User/user.schema.js";
import { UserService } from "../User/user.service.js";
import { readSession } from "./auth.session.js";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request): string | null => {
          return readSession(request).accessToken ?? null;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: appConfig.jwtSecret,
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
  }): Promise<AuthenticatedUser> {
    const user = await this.userService.get(payload.sub);

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const { password: _password, ...result } = user;
    return result;
  }
}
