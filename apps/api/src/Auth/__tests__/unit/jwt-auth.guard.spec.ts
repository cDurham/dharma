import { ExecutionContext } from "@nestjs/common";
import { JwtAuthGuard } from "../../jwt-auth.guard";

describe("JwtAuthGuard", () => {
  it("should extract request from GraphQL context", () => {
    const guard = new JwtAuthGuard();
    const request = { headers: { authorization: "Bearer token" } };
    
    const mockExecutionContext = {
      getType: jest.fn().mockReturnValue("graphql"),
      getArgs: jest.fn().mockReturnValue([null, null, { req: request }, null]),
      getArgByIndex: jest.fn((index: number) => {
        const args = [null, null, { req: request }, null];
        return args[index];
      }),
      switchToHttp: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getClass: jest.fn(),
      getHandler: jest.fn(),
    } as unknown as ExecutionContext;

    const result = guard.getRequest(mockExecutionContext);

    expect(result).toBe(request);
  });
});
