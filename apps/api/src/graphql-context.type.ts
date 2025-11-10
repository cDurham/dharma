import { Request, Response } from "express";
import { AuthCookies } from "./Auth/auth.cookies";
import { AuthenticatedUser } from "./User/user.schema";

export interface GraphQLContext {
  req: Request & {
    user?: AuthenticatedUser;
    cookies: AuthCookies;
  };
  res: Response;
}
