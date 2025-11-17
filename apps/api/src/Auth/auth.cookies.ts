import type { Request } from "express";
import { z } from "zod";

export const AuthCookiesSchema = z.object({
  access_token: z.string().optional(),
  refresh_token: z.string().optional(),
});

export type AuthCookies = z.infer<typeof AuthCookiesSchema>;

export function getAuthCookies(req: Request): AuthCookies {
  return AuthCookiesSchema.parse(req.cookies || {});
}

export function getRefreshToken(req: Request): string | undefined {
  const cookies = getAuthCookies(req);
  return cookies.refresh_token;
}

export function getAccessToken(req: Request): string | undefined {
  const cookies = getAuthCookies(req);
  return cookies.access_token;
}
