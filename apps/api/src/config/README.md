# App configuration

`app.config.ts` is the app's one config module: every environment variable it
reads is parsed and validated by a single zod schema at import time, and every
consumer imports the resulting frozen `appConfig` object instead of reading
`process.env` itself. A missing or malformed variable throws at boot, not as
a `NaN` or `undefined` surfacing later in `jwt.sign` or the DB pool.

## Environment variables

### General

- `NODE_ENV`: `development` | `test` | `production` (default: `development`)
- `FRONTEND_URL`: origin allowed by CORS, and the CSRF-relevant single origin
  (default: `http://localhost:4200`)

### JWT

- `JWT_SECRET`: secret key for JWT signing (required)
- `JWT_ACCESS_TOKEN_EXPIRES_IN`: access token expiration in seconds (default: 900)
- `JWT_REFRESH_TOKEN_EXPIRES_IN_DAYS`: refresh token expiration in days (default: 30)

### Cookies

- `COOKIE_SECRET`: secret key for cookie signing (required)

Cookie max-age is not configured directly. Each session cookie takes its
max-age from the lifetime of the token it carries, so the cookie and the
credential inside it expire together.

### Database

- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`: required, no fallback
- `DB_PORT`: default `5432`

## Default values

- Access token: 15 minutes
- Refresh token: 30 days
- DB port: 5432
