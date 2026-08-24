import { UnauthorizedException } from "@nestjs/common";
import { Args, Context, Mutation, Resolver } from "@nestjs/graphql";
import { Throttle } from "@nestjs/throttler";
import type { GraphQLContext } from "../graphql-context.type.js";
import { LoginResponse } from "./auth.dto.js";
import { ValidateUserInput } from "./auth.input.js";
import { AuthService } from "./auth.service.js";
import { clearSession, readSession, setSession } from "./auth.session.js";
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
    const tokens = await this.authService.login(user);

    setSession(context.res, tokens);

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
    const { refreshToken } = readSession(context.req);
    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token not found");
    }

    // Rotation: the refresh cookie is replaced along with the access cookie.
    const tokens = await this.authService.refreshAccessToken(refreshToken);
    setSession(context.res, tokens);

    return true;
  }

  // Public: logout must work with an expired access token, or users could
  // never clear a stale session. It reads only the refresh cookie.
  @Public()
  @Mutation(() => Boolean)
  async logout(@Context() context: GraphQLContext): Promise<boolean> {
    const { refreshToken } = readSession(context.req);
    if (refreshToken) {
      await this.authService.revokeRefreshToken(refreshToken);
    }

    return clearSession(context.res);
  }
}
