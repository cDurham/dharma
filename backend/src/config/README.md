# Authentication Configuration

This directory contains centralized configuration for authentication-related settings.

## Environment Variables

The following environment variables can be used to configure authentication timeouts:

### JWT Configuration

- `JWT_SECRET`: Secret key for JWT signing (required)
- `JWT_ACCESS_TOKEN_EXPIRES_IN`: Access token expiration time in JWT format (default: "15m")
- `JWT_ACCESS_TOKEN_MAX_AGE_MS`: Access token max age in milliseconds (default: 900000 - 15 minutes)
- `JWT_REFRESH_TOKEN_EXPIRES_IN_DAYS`: Refresh token expiration in days (default: 30)
- `JWT_REFRESH_TOKEN_MAX_AGE_MS`: Refresh token max age in milliseconds (default: 2592000000 - 30 days)

### Cookie Configuration

- `COOKIE_ACCESS_TOKEN_MAX_AGE_MS`: Access token cookie max age in milliseconds (default: 900000 - 15 minutes)
- `COOKIE_REFRESH_TOKEN_MAX_AGE_MS`: Refresh token cookie max age in milliseconds (default: 604800000 - 7 days)

## Default Values

- Access Token: 15 minutes
- Refresh Token: 30 days
- Access Token Cookie: 15 minutes
- Refresh Token Cookie: 7 days
