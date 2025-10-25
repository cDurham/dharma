import { ExecutionContextHost } from "@nestjs/core/helpers/execution-context-host";
import { JwtAuthGuard } from "../../jwt-auth.guard";

describe("JwtAuthGuard", () => {
  it("should extract request from GraphQL context", () => {
    const guard = new JwtAuthGuard();
    const request = { headers: { authorization: "Bearer token" } };
    const gqlContext = { req: request };
    const executionContext = new ExecutionContextHost([null, null, gqlContext]);
    executionContext.setType("graphql");

    const result = guard.getRequest(executionContext);

    expect(result).toBe(request);
  });
});
