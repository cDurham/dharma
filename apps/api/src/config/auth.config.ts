const MS_PER_SECOND = 1000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface AuthConfig {
  accessToken: {
    expiresIn: number; // Duration in seconds
  };
  refreshToken: {
    expiresInDays: number;
  };
  cookie: {
    accessTokenMaxAgeMs: number;
    refreshTokenMaxAgeMs: number;
  };
}

// Each lifetime is configured once. A cookie's max-age is derived from the
// lifetime of the token it carries, so the two expire together.
const accessTokenExpiresInSeconds = Number.parseInt(
  process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || "900",
  10,
); // 15 minutes

const refreshTokenExpiresInDays = Number.parseInt(
  process.env.JWT_REFRESH_TOKEN_EXPIRES_IN_DAYS || "30",
  10,
);

export const authConfig: AuthConfig = {
  accessToken: {
    expiresIn: accessTokenExpiresInSeconds,
  },
  refreshToken: {
    expiresInDays: refreshTokenExpiresInDays,
  },
  cookie: {
    accessTokenMaxAgeMs: accessTokenExpiresInSeconds * MS_PER_SECOND,
    refreshTokenMaxAgeMs: refreshTokenExpiresInDays * MS_PER_DAY,
  },
};

// The expiry stamped on the refresh_token row. Equals the refresh cookie's
// max-age by construction.
export const getRefreshTokenExpiresInMs = (): number => {
  return authConfig.refreshToken.expiresInDays * MS_PER_DAY;
};
