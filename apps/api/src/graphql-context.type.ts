import type { Request, Response } from "express";
import type { SessionCookies } from "./Auth/auth.session.js";
import type { AuthenticatedUser } from "./User/user.schema.js";

export interface GraphQLContext {
  req: Request & {
    user?: AuthenticatedUser;
    cookies: SessionCookies;
  };
  res: Response;
}
