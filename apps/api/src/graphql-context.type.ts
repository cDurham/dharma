import type { Request, Response } from "express";
import type { AuthCookies } from "./Auth/auth.cookies";
import type { AuthenticatedUser } from "./User/user.schema";

export interface GraphQLContext {
  req: Request & {
    user?: AuthenticatedUser;
    cookies: AuthCookies;
  };
  res: Response;
}
