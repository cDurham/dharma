import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import {
  AuthenticatedUser,
  AuthenticatedUserSchema,
} from "../User/user.schema";

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req?.user;

    const result = AuthenticatedUserSchema.safeParse(user);

    if (!result.success) {
      throw new UnauthorizedException(
        `Invalid user context: ${result.error.issues.map((i) => i.message).join(", ")}`
      );
    }

    return result.data;
  }
);
