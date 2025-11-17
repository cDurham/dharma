export interface AuthConfig {
  accessToken: {
    expiresIn: number; // Duration in seconds
    maxAgeMs: number;
  };
  refreshToken: {
    expiresInDays: number;
    maxAgeMs: number;
  };
  cookie: {
    accessTokenMaxAgeMs: number;
    refreshTokenMaxAgeMs: number;
  };
}

export const authConfig: AuthConfig = {
  accessToken: {
    expiresIn: Number.parseInt(
      process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || "900",
      10,
    ), // 15 minutes in seconds
    maxAgeMs: Number.parseInt(
      process.env.JWT_ACCESS_TOKEN_MAX_AGE_MS || "900000",
      10,
    ), // 15 minutes in milliseconds
  },
  refreshToken: {
    expiresInDays: Number.parseInt(
      process.env.JWT_REFRESH_TOKEN_EXPIRES_IN_DAYS || "30",
      10,
    ),
    maxAgeMs: Number.parseInt(
      process.env.JWT_REFRESH_TOKEN_MAX_AGE_MS || "2592000000",
      10,
    ), // 30 days in milliseconds
  },
  cookie: {
    accessTokenMaxAgeMs: Number.parseInt(
      process.env.COOKIE_ACCESS_TOKEN_MAX_AGE_MS || "900000",
      10,
    ), // 15 minutes
    refreshTokenMaxAgeMs: Number.parseInt(
      process.env.COOKIE_REFRESH_TOKEN_MAX_AGE_MS || "604800000",
      10,
    ), // 7 days
  },
};

// Helper functions for common calculations
export const getRefreshTokenExpiresInMs = (): number => {
  return authConfig.refreshToken.expiresInDays * 24 * 60 * 60 * 1000;
};

export const getAccessTokenExpiresInMs = (): number => {
  return authConfig.accessToken.maxAgeMs;
};
