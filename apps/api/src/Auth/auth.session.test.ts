import type { Request, Response } from "express";
import { appConfig, getRefreshTokenExpiresInMs } from "../config/app.config.js";
import { clearSession, readSession, setSession } from "./auth.session.js";

interface RecordedCookie {
  name: string;
  value: string;
  options: Record<string, unknown>;
}

function recordingResponse(): { res: Response; written: RecordedCookie[] } {
  const written: RecordedCookie[] = [];
  const res = {
    cookie(name: string, value: string, options: Record<string, unknown>) {
      written.push({ name, value, options });
      return res;
    },
  } as unknown as Response;
  return { res, written };
}

const tokens = { access_token: "access-abc", refresh_token: "refresh-xyz" };

describe("session module", () => {
  it("reads both halves of the session off the request", () => {
    const req = {
      cookies: { access_token: "a", refresh_token: "r" },
    } as unknown as Request;

    expect(readSession(req)).toEqual({
      accessToken: "a",
      refreshToken: "r",
    });
  });

  it("treats a request with no cookies as no session", () => {
    expect(readSession({} as Request)).toEqual({
      accessToken: undefined,
      refreshToken: undefined,
    });
  });

  it("writes both cookies with one policy and the configured lifetimes", () => {
    const { res, written } = recordingResponse();

    expect(setSession(res, tokens)).toBe(true);
    expect(written.map((c) => [c.name, c.value])).toEqual([
      ["access_token", "access-abc"],
      ["refresh_token", "refresh-xyz"],
    ]);
    for (const { options } of written) {
      expect(options.httpOnly).toBe(true);
      expect(options.sameSite).toBe("strict");
      // NODE_ENV is "test", so the production policy applies.
      expect(options.secure).toBe(true);
    }
    expect(written[0].options.maxAge).toBe(
      appConfig.cookie.accessTokenMaxAgeMs,
    );
    expect(written[1].options.maxAge).toBe(
      appConfig.cookie.refreshTokenMaxAgeMs,
    );
  });

  // Only /graphql ever reads these cookies; the refresh cookie is scoped to
  // it so it never rides along on unrelated requests.
  it("scopes the refresh cookie to /graphql, and leaves the access cookie unscoped", () => {
    const { res, written } = recordingResponse();

    setSession(res, tokens);

    expect(written[0].options.path).toBeUndefined();
    expect(written[1].options.path).toBe("/graphql");
  });

  // The refresh cookie and the refresh_token row expire together.
  it("expires the refresh cookie when the refresh token row expires", () => {
    expect(appConfig.cookie.refreshTokenMaxAgeMs).toBe(
      getRefreshTokenExpiresInMs(),
    );
  });

  it("expires the access cookie when the access token expires", () => {
    expect(appConfig.cookie.accessTokenMaxAgeMs).toBe(
      appConfig.accessToken.expiresIn * 1000,
    );
  });

  // A cleared cookie replaces the live one only if every attribute except
  // maxAge matches.
  it("clears with the same attributes it wrote, differing only in maxAge", () => {
    const write = recordingResponse();
    setSession(write.res, tokens);
    const clear = recordingResponse();

    expect(clearSession(clear.res)).toBe(true);
    expect(clear.written.map((c) => c.name)).toEqual([
      "access_token",
      "refresh_token",
    ]);
    for (const [i, cleared] of clear.written.entries()) {
      expect(cleared.value).toBe("");
      expect(cleared.options.maxAge).toBe(0);
      const { maxAge: _written, ...writtenRest } = write.written[i].options;
      const { maxAge: _cleared, ...clearedRest } = cleared.options;
      expect(clearedRest).toEqual(writtenRest);
    }
  });

  it("reports failure instead of claiming a session on a cookie-less response", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(setSession(undefined, tokens)).toBe(false);
    expect(clearSession({} as Response)).toBe(false);
    expect(warn).toHaveBeenCalledTimes(2);

    warn.mockRestore();
  });
});
