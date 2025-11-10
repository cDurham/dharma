import { UnauthorizedException } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { Request, Response } from "express";
import { Args, Context, Mutation, Resolver } from "@nestjs/graphql";
import { LoginResponse } from "./auth.dto";
import { ValidateUserInput } from "./auth.input";
import { AuthLoginUserCommand } from "./command/auth-login-user.command";
import { AuthRefreshAccessTokenCommand } from "./command/auth-refresh-access-token.command";
import { AuthRevokeRefreshTokenCommand } from "./command/auth-revoke-refresh-token.command";
import { ValidateUserCommand } from "./command/auth-validate-user.command";
import { authConfig } from "../config/auth.config";
import { User } from "../User/user.entity";

@Resolver()
export class AuthResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @Mutation(() => LoginResponse)
  async login(
    @Args("data") loginInput: ValidateUserInput,
    @Context() context: { res: Response }
  ): Promise<LoginResponse> {
    const user = await this.commandBus.execute(
      new ValidateUserCommand(loginInput)
    );

    const { access_token, refresh_token } = await this.commandBus.execute(
      new AuthLoginUserCommand(user)
    );

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
        "Unable to set cookie: Response object not available in context"
      );
    }

    return {
      message: "Login successful",
    };
  }

  @Mutation(() => Boolean)
  async refreshAccessToken(
    @Context() context: { res: Response; req: Request }
  ): Promise<boolean> {
    const refreshToken = context.req.cookies.refresh_token as string;
    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token not found");
    }
    const { access_token, refresh_token } = await this.commandBus.execute(
      new AuthRefreshAccessTokenCommand(refreshToken)
    );

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

  @Mutation(() => Boolean)
  async logout(
    @Context() context: { res: Response; req: Request }
  ): Promise<boolean> {
    const refreshToken = context.req?.cookies?.refresh_token as string | undefined;
    if (refreshToken) {
      await this.commandBus.execute(
        new AuthRevokeRefreshTokenCommand(refreshToken)
      );
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
        "Unable to clear cookie: Response object not available in context"
      );
      return false;
    }
  }
}
