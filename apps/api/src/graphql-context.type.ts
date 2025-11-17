import type { Request, Response } from "express";
import type { AuthCookies } from "./Auth/auth.cookies.js";
import type { AuthenticatedUser } from "./User/user.schema.js";

export interface GraphQLContext {
  req: Request & {
    user?: AuthenticatedUser;
    cookies: AuthCookies;
  };
  res: Response;
}
