import { Injectable, UnauthorizedException } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import type { QueryBus } from "@nestjs/cqrs";
import { PassportStrategy } from "@nestjs/passport";
import type { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { GetUserQuery } from "../User/command/get-user.query";
import type { User } from "../User/user.entity";
import type { AuthenticatedUser } from "../User/user.schema";
import { getAccessToken } from "./auth.cookies";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly queryBus: QueryBus,
  ) {
    const secret = configService.get<string>("JWT_SECRET");
    if (!secret) {
      throw new Error(
        "JWT_SECRET environment variable is required but not set",
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request): string | null => {
          return getAccessToken(request) ?? null;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
  }): Promise<AuthenticatedUser> {
    const user = await this.queryBus.execute<User | null>(
      new GetUserQuery(payload.sub),
    );

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    // Exclude password from the returned user object
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...result } = user;
    return result;
  }
}
