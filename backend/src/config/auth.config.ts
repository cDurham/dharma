export interface AuthConfig {
  accessToken: {
    expiresIn: string;
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
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || "15m",
    maxAgeMs: parseInt(process.env.JWT_ACCESS_TOKEN_MAX_AGE_MS || "900000"), // 15 minutes in milliseconds
  },
  refreshToken: {
    expiresInDays: parseInt(
      process.env.JWT_REFRESH_TOKEN_EXPIRES_IN_DAYS || "30"
    ),
    maxAgeMs: parseInt(
      process.env.JWT_REFRESH_TOKEN_MAX_AGE_MS || "2592000000"
    ), // 30 days in milliseconds
  },
  cookie: {
    accessTokenMaxAgeMs: parseInt(
      process.env.COOKIE_ACCESS_TOKEN_MAX_AGE_MS || "900000"
    ), // 15 minutes
    refreshTokenMaxAgeMs: parseInt(
      process.env.COOKIE_REFRESH_TOKEN_MAX_AGE_MS || "604800000"
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
