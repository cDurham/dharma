# Authentication Configuration

This directory contains centralized configuration for authentication-related settings.

## Environment Variables

The following environment variables can be used to configure authentication timeouts:

### JWT Configuration

- `JWT_SECRET`: Secret key for JWT signing (required)
- `JWT_ACCESS_TOKEN_EXPIRES_IN`: Access token expiration in seconds (default: 900)
- `JWT_REFRESH_TOKEN_EXPIRES_IN_DAYS`: Refresh token expiration in days (default: 30)

### Cookie Configuration

- `COOKIE_SECRET`: Secret key for cookie signing (required)

Cookie max-age is not configured directly. Each session cookie takes its max-age
from the lifetime of the token it carries, so the cookie and the credential
inside it expire together.

## Default Values

- Access Token: 15 minutes
- Refresh Token: 30 days
