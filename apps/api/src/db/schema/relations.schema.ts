import { relations } from "drizzle-orm";
import { member } from "./member.schema";
import { refreshToken } from "./refresh-token.schema";
import { user } from "./user.schema";

/**
 * User relations
 */
export const userRelations = relations(user, ({ many }) => ({
  refreshTokens: many(refreshToken),
}));

/**
 * Member relations
 */
export const memberRelations = relations(member, ({ one }) => ({
  user: one(user, {
    fields: [member.userUuid],
    references: [user.uuid],
  }),
}));

/**
 * RefreshToken relations
 */
export const refreshTokenRelations = relations(refreshToken, ({ one }) => ({
  user: one(user, {
    fields: [refreshToken.userUuid],
    references: [user.uuid],
  }),
}));
