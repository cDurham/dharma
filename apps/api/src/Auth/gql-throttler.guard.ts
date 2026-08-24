import { type ExecutionContext, Injectable } from "@nestjs/common";
import { type GqlContextType, GqlExecutionContext } from "@nestjs/graphql";
import { ThrottlerGuard } from "@nestjs/throttler";
import type { Request, Response } from "express";
import type { GraphQLContext } from "../graphql-context.type.js";

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  protected getRequestResponse(context: ExecutionContext): {
    req: Request;
    res: Response;
  } {
    if (context.getType<GqlContextType>() === "graphql") {
      const { req, res } =
        GqlExecutionContext.create(context).getContext<GraphQLContext>();
      return { req, res };
    }
    return super.getRequestResponse(context) as { req: Request; res: Response };
  }
}
