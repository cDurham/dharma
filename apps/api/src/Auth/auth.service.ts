import crypto from "node:crypto";
import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { appConfig, getRefreshTokenExpiresInMs } from "../config/app.config.js";
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

// The minimal shape mintRefreshToken needs: either the pooled db or an
// open transaction, both of which expose `insert`.
type InsertExecutor = Pick<typeof DbType, "insert">;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

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

    if (!existing) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const isValid = await bcrypt.compare(
      refreshTokenString,
      existing.token.hashedToken,
    );
    if (!isValid) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    if (existing.token.isRevoked) {
      // Replay of a token that's already been rotated away: either a slow
      // client retried, or the token was stolen. Treat it as theft and kill
      // the whole lineage, not just this one row.
      this.logger.warn(
        `Refresh token reuse detected, revoking family ${existing.token.family}`,
      );
      await this.db
        .update(refreshToken)
        .set({ isRevoked: true })
        .where(eq(refreshToken.family, existing.token.family));
      throw new UnauthorizedException("Invalid refresh token");
    }

    if (existing.token.expiresAt < new Date()) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    // Revoke the presented token and mint its replacement in one
    // transaction, so a crash between the two can't strand the user with
    // neither a valid cookie nor a valid row.
    return this.db.transaction(async (tx) => {
      await tx
        .update(refreshToken)
        .set({ isRevoked: true })
        .where(eq(refreshToken.tokenHash, tokenHash));

      return {
        access_token: this.signAccessToken(existing.user),
        refresh_token: await this.mintRefreshToken(
          existing.user.uuid,
          existing.token.family,
          tx,
        ),
      };
    });
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
      { expiresIn: appConfig.accessToken.expiresIn },
    );
  }

  // tokenHash (sha256) is the indexed lookup key; hashedToken (bcrypt) is
  // what the presented token is verified against. `family` defaults to a
  // fresh uuid for a new login lineage; rotation passes the existing one
  // through so reuse detection can revoke it as a unit.
  private async mintRefreshToken(
    userUuid: string,
    family: string = uuidv7(),
    executor: InsertExecutor = this.db,
  ): Promise<string> {
    const plainToken = crypto.randomBytes(32).toString("hex");
    await executor.insert(refreshToken).values({
      uuid: uuidv7(),
      userUuid,
      family,
      tokenHash: hashToken(plainToken),
      hashedToken: await bcrypt.hash(plainToken, 12),
      expiresAt: new Date(Date.now() + getRefreshTokenExpiresInMs()),
      isRevoked: false,
    });
    return plainToken;
  }
}
