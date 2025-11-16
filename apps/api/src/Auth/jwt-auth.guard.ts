import { type ExecutionContext, Injectable } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { AuthGuard } from "@nestjs/passport";
import type { Request } from "express";
import type { GraphQLContext } from "../graphql-context.type";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  getRequest(context: ExecutionContext): Request {
    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx.getContext<GraphQLContext>();
    return gqlContext.req;
  }
}
