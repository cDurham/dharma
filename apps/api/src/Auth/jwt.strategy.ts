import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { QueryBus } from "@nestjs/cqrs";
import { Request } from "express";
import { Strategy, ExtractJwt } from "passport-jwt";
import { GetUserQuery } from "../User/command/get-user.query";
import { User } from "../User/user.entity";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly queryBus: QueryBus
  ) {
    const secret = configService.get<string>("JWT_SECRET");
    if (!secret) {
      throw new Error("JWT_SECRET environment variable is required but not set");
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Primary: Extract from cookie
        (request: Request) => {
          return request?.cookies?.access_token;
        },
        // Fallback: Extract from Authorization header
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: { sub: string; email: string }): Promise<User> {
    const user = await this.queryBus.execute(new GetUserQuery(payload.sub));
    
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    // Exclude password from the returned user object
    const { password, ...result } = user;
    return result as User;
  }
}

