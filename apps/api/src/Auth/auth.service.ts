import crypto from "node:crypto";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import {
  authConfig,
  getRefreshTokenExpiresInMs,
} from "../config/auth.config.js";
import type { db as DbType } from "../db/data-source.js";
import { DB_TOKEN } from "../db/database.module.js";
import { refreshToken, user } from "../db/schema/index.js";
import type { UserRow } from "../db/types.js";
import { UserService } from "../User/user.service.js";
import type { ValidateUserInput } from "./auth.input.js";
import { hashToken } from "./utils.js";

export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async validateUser(
    input: ValidateUserInput,
  ): Promise<Omit<UserRow, "password">> {
    const existing = await this.userService.getByEmail(input.email);
    if (!existing) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const isPasswordValid = await bcrypt.compare(
      input.password,
      existing.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }
    if (existing.verificationToken !== null) {
      throw new UnauthorizedException("Email not verified");
    }
    const { password: _password, ...result } = existing;
    return result;
  }

  async login(user: Pick<UserRow, "uuid" | "email">): Promise<TokenPair> {
    return {
      access_token: this.signAccessToken(user),
      refresh_token: await this.mintRefreshToken(user.uuid),
    };
  }

  async refreshAccessToken(refreshTokenString: string): Promise<TokenPair> {
    const tokenHash = hashToken(refreshTokenString);
    const [existing] = await this.db
      .select({ token: refreshToken, user: user })
      .from(refreshToken)
      .innerJoin(user, eq(refreshToken.userUuid, user.uuid))
      .where(eq(refreshToken.tokenHash, tokenHash));

    const isValid =
      existing &&
      (await bcrypt.compare(refreshTokenString, existing.token.hashedToken));
    if (
      !existing ||
      !isValid ||
      existing.token.expiresAt < new Date() ||
      existing.token.isRevoked
    ) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    // Rotation: the presented token is dead from here on.
    await this.db
      .update(refreshToken)
      .set({ isRevoked: true })
      .where(eq(refreshToken.tokenHash, tokenHash));

    return {
      access_token: this.signAccessToken(existing.user),
      refresh_token: await this.mintRefreshToken(existing.user.uuid),
    };
  }

  async revokeRefreshToken(token: string): Promise<void> {
    const tokenHash = hashToken(token);
    await this.db
      .update(refreshToken)
      .set({ isRevoked: true })
      .where(eq(refreshToken.tokenHash, tokenHash));
  }

  private signAccessToken(user: Pick<UserRow, "uuid" | "email">): string {
    return this.jwtService.sign(
      { email: user.email, sub: user.uuid },
      { expiresIn: authConfig.accessToken.expiresIn },
    );
  }

  // tokenHash (sha256) is the indexed lookup key; hashedToken (bcrypt) is
  // what the presented token is verified against.
  private async mintRefreshToken(userUuid: string): Promise<string> {
    const plainToken = crypto.randomBytes(32).toString("hex");
    await this.db.insert(refreshToken).values({
      uuid: uuidv7(),
      userUuid,
      tokenHash: hashToken(plainToken),
      hashedToken: await bcrypt.hash(plainToken, 12),
      expiresAt: new Date(Date.now() + getRefreshTokenExpiresInMs()),
      isRevoked: false,
    });
    return plainToken;
  }
}
