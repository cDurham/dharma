import { Request } from "express";

export interface JwtPayload {
  sub: string;
  email: string;
  [key: string]: unknown;
}

export const createJwtPayload = (
  overrides: Partial<JwtPayload> = {}
): JwtPayload => ({
  sub: "user-uuid-123",
  email: "user@example.com",
  ...overrides,
});

export const createRequest = (
  options: {
    cookies?: Record<string, string>;
    headers?: Record<string, string>;
  } = {}
): Request =>
  ({
    cookies: options.cookies ?? {},
    headers: options.headers ?? {},
  } as unknown as Request);
