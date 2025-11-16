import type { RefreshTokenRow } from "../db/types";

export class RefreshToken implements RefreshTokenRow {
  uuid!: string;
  tokenHash!: string;
  userUuid!: string;
  expiresAt!: Date;
  isRevoked!: boolean;
  hashedToken!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
