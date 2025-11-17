import {
  createParamDecorator,
  type ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import type { GraphQLContext } from "../graphql-context.type.js";
import {
  type AuthenticatedUser,
  AuthenticatedUserSchema,
} from "../User/user.schema.js";

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx.getContext<GraphQLContext>();
    const user = gqlContext.req?.user;

    const result = AuthenticatedUserSchema.safeParse(user);

    if (!result.success) {
      throw new UnauthorizedException(
        `Invalid user context: ${result.error.issues.map((i) => i.message).join(", ")}`,
      );
    }

    return result.data;
  },
);
