import { type ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { type GqlContextType, GqlExecutionContext } from "@nestjs/graphql";
import { AuthGuard } from "@nestjs/passport";
import type { Request } from "express";
import type { GraphQLContext } from "../graphql-context.type.js";
import { IS_PUBLIC_KEY } from "./public.decorator.js";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  getRequest(context: ExecutionContext): Request {
    if (context.getType<GqlContextType>() === "graphql") {
      return GqlExecutionContext.create(context).getContext<GraphQLContext>()
        .req;
    }
    return context.switchToHttp().getRequest<Request>();
  }
}
