import { UnauthorizedException } from "@nestjs/common";
import { Args, Context, Mutation, Resolver } from "@nestjs/graphql";
import { Throttle } from "@nestjs/throttler";
import { authConfig } from "../config/auth.config.js";
import type { GraphQLContext } from "../graphql-context.type.js";
import { getRefreshToken } from "./auth.cookies.js";
import { LoginResponse } from "./auth.dto.js";
import { ValidateUserInput } from "./auth.input.js";
import { AuthService } from "./auth.service.js";
import { Public } from "./public.decorator.js";

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Mutation(() => LoginResponse)
  async login(
    @Args("data") loginInput: ValidateUserInput,
    @Context() context: GraphQLContext,
  ): Promise<LoginResponse> {
    const user = await this.authService.validateUser(loginInput);
    const { access_token, refresh_token } = await this.authService.login(user);

    if (context.res && typeof context.res.cookie === "function") {
      // set short-lived access token
      context.res.cookie("access_token", access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        maxAge: authConfig.cookie.accessTokenMaxAgeMs,
      });
      // set long-lived refresh token
      context.res.cookie("refresh_token", refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        maxAge: authConfig.cookie.refreshTokenMaxAgeMs,
      });
    } else {
      console.warn(
        "Unable to set cookie: Response object not available in context",
      );
    }

    return {
      message: "Login successful",
    };
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Mutation(() => Boolean)
  async refreshAccessToken(
    @Context() context: GraphQLContext,
  ): Promise<boolean> {
    const refreshToken = getRefreshToken(context.req);
    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token not found");
    }

    const { access_token, refresh_token } =
      await this.authService.refreshAccessToken(refreshToken);

    // Set new access token cookie
    context.res.cookie("access_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: authConfig.cookie.accessTokenMaxAgeMs,
    });

    // Set new refresh token cookie (rotation)
    context.res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: authConfig.cookie.refreshTokenMaxAgeMs,
    });

    return true;
  }

  // Public: logout must work with an expired access token, or users could
  // never clear a stale session. It reads only the refresh cookie.
  @Public()
  @Mutation(() => Boolean)
  async logout(@Context() context: GraphQLContext): Promise<boolean> {
    const refreshToken = getRefreshToken(context.req);
    if (refreshToken) {
      await this.authService.revokeRefreshToken(refreshToken);
    }

    if (context.res && typeof context.res.cookie === "function") {
      // clear short-lived access token
      context.res.cookie("access_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        maxAge: 0,
      });
      // clear long-lived refresh token
      context.res.cookie("refresh_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        maxAge: 0,
      });
      return true;
    } else {
      console.warn(
        "Unable to clear cookie: Response object not available in context",
      );
      return false;
    }
  }
}
