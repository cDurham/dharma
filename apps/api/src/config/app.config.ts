import { z } from "zod";

const MS_PER_SECOND = 1000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Every environment variable the app depends on, read and validated exactly
// once at import time. A typo here throws at boot instead of sailing into
// jwt.sign or the DB pool as `undefined` or a silent NaN.
const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  FRONTEND_URL: z.string().url().default("http://localhost:4200"),

  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_ACCESS_TOKEN_EXPIRES_IN: z.coerce.number().int().positive().default(900), // 15 minutes
  JWT_REFRESH_TOKEN_EXPIRES_IN_DAYS: z.coerce
    .number()
    .int()
    .positive()
    .default(30),
  COOKIE_SECRET: z.string().min(1, "COOKIE_SECRET is required"),

  DB_HOST: z.string().min(1, "DB_HOST is required"),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_USER: z.string().min(1, "DB_USER is required"),
  DB_PASSWORD: z.string().min(1, "DB_PASSWORD is required"),
  DB_DATABASE: z.string().min(1, "DB_DATABASE is required"),
});

function loadEnv() {
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return result.data;
}

const env = loadEnv();

export const appConfig = Object.freeze({
  nodeEnv: env.NODE_ENV,
  isProduction: env.NODE_ENV === "production",
  frontendUrl: env.FRONTEND_URL,
  jwtSecret: env.JWT_SECRET,
  cookieSecret: env.COOKIE_SECRET,
  accessToken: Object.freeze({
    expiresIn: env.JWT_ACCESS_TOKEN_EXPIRES_IN,
  }),
  refreshToken: Object.freeze({
    expiresInDays: env.JWT_REFRESH_TOKEN_EXPIRES_IN_DAYS,
  }),
  // Each cookie's max-age is derived from the lifetime of the token it
  // carries, so the cookie and the credential inside it expire together.
  cookie: Object.freeze({
    accessTokenMaxAgeMs: env.JWT_ACCESS_TOKEN_EXPIRES_IN * MS_PER_SECOND,
    refreshTokenMaxAgeMs: env.JWT_REFRESH_TOKEN_EXPIRES_IN_DAYS * MS_PER_DAY,
  }),
  db: Object.freeze({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE,
  }),
});

// The expiry stamped on the refresh_token row. Equals the refresh cookie's
// max-age by construction.
export const getRefreshTokenExpiresInMs = (): number =>
  appConfig.refreshToken.expiresInDays * MS_PER_DAY;
