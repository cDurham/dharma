import crypto from "node:crypto";

/**
 * Creates a SHA-256 hash of the provided token
 * @param token - The token to hash
 * @returns The hexadecimal hash of the token
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
