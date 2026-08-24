import type { CookieOptions, Request, Response } from "express";
import { z } from "zod";
import { authConfig } from "../config/auth.config.js";
import type { TokenPair } from "./auth.service.js";

// The wire names of the session cookies. The read schema and both write
// paths derive from these, so a rename cannot half-apply.
const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";

export const SessionCookiesSchema = z.object({
  [ACCESS_TOKEN_COOKIE]: z.string().optional(),
  [REFRESH_TOKEN_COOKIE]: z.string().optional(),
});

export type SessionCookies = z.infer<typeof SessionCookiesSchema>;

export interface Session {
  accessToken?: string;
  refreshToken?: string;
}

// Options shared by every session cookie. `secure` is read per call, so a
// NODE_ENV assigned after this module is imported still applies.
function sessionCookieOptions(maxAge: number): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge,
  };
}

// Nest's GraphQL context does not guarantee an Express response: subscriptions
// and some test transports supply an object with no `cookie` method.
function canWriteCookies(
  res: Response | undefined,
): res is Response & { cookie: Response["cookie"] } {
  return Boolean(res) && typeof res?.cookie === "function";
}

export function readSession(req: Request): Session {
  const cookies = SessionCookiesSchema.parse(req.cookies || {});
  return {
    accessToken: cookies[ACCESS_TOKEN_COOKIE],
    refreshToken: cookies[REFRESH_TOKEN_COOKIE],
  };
}

/**
 * Write a freshly minted token pair to the response. Returns false when the
 * response cannot carry cookies, meaning no session was established.
 */
export function setSession(
  res: Response | undefined,
  tokens: TokenPair,
): boolean {
  if (!canWriteCookies(res)) {
    console.warn(
      "Unable to set session cookies: Response object not available in context",
    );
    return false;
  }

  res.cookie(
    ACCESS_TOKEN_COOKIE,
    tokens.access_token,
    sessionCookieOptions(authConfig.cookie.accessTokenMaxAgeMs),
  );
  res.cookie(
    REFRESH_TOKEN_COOKIE,
    tokens.refresh_token,
    sessionCookieOptions(authConfig.cookie.refreshTokenMaxAgeMs),
  );
  return true;
}

/**
 * Expire both cookies. Carries the same options as the write path: a cleared
 * cookie replaces the live one only if every attribute except maxAge matches.
 */
export function clearSession(res: Response | undefined): boolean {
  if (!canWriteCookies(res)) {
    console.warn(
      "Unable to clear session cookies: Response object not available in context",
    );
    return false;
  }

  res.cookie(ACCESS_TOKEN_COOKIE, "", sessionCookieOptions(0));
  res.cookie(REFRESH_TOKEN_COOKIE, "", sessionCookieOptions(0));
  return true;
}
