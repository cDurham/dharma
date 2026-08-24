import type { INestApplication } from "@nestjs/common";
import request from "supertest";

export type GraphQLSuccess<TData> = {
  data: TData;
  errors?: undefined;
};

export type GraphQLErrorItem = {
  message: string;
  path?: readonly (string | number)[];
  extensions?: Record<string, unknown>;
};

export type GraphQLErrorResponse = {
  data?: null;
  errors: GraphQLErrorItem[];
};

export type GraphQLResponse<TData> =
  | GraphQLSuccess<TData>
  | GraphQLErrorResponse;

export interface GraphQLClient {
  query<TData, TVariables = Record<string, unknown>>(
    options: GraphQLOperationOptions<TVariables>,
  ): Promise<GraphQLResponse<TData>>;
  mutation<TData, TVariables = Record<string, unknown>>(
    options: GraphQLOperationOptions<TVariables>,
  ): Promise<GraphQLResponse<TData>>;
  expectOk<TData>(
    response: GraphQLResponse<TData>,
  ): asserts response is GraphQLSuccess<TData>;
  cookies(): Record<string, string>;
  clearCookies(): void;
}

export interface GraphQLOperationOptions<TVariables> {
  query: string;
  variables?: TVariables;
  headers?: Record<string, string>;
}

export function createGraphQLClient(app: INestApplication): GraphQLClient {
  const agent = request(app.getHttpServer() as Parameters<typeof request>[0]);

  // Manual jar instead of request.agent(): the API issues Secure cookies
  // (NODE_ENV=test), which superagent's jar refuses to replay over plain http.
  const jar = new Map<string, string>();

  function storeCookies(setCookie: string | string[] | undefined) {
    const entries = Array.isArray(setCookie)
      ? setCookie
      : setCookie
        ? [setCookie]
        : [];
    for (const entry of entries) {
      const [pair] = entry.split(";");
      const separator = pair.indexOf("=");
      if (separator < 1) {
        continue;
      }
      const name = pair.slice(0, separator).trim();
      const value = pair.slice(separator + 1).trim();
      if (value === "") {
        jar.delete(name);
      } else {
        jar.set(name, value);
      }
    }
  }

  async function execute<TData, TVariables>({
    query,
    variables,
    headers = {},
  }: GraphQLOperationOptions<TVariables>): Promise<GraphQLResponse<TData>> {
    const pending = agent.post("/graphql");
    if (jar.size > 0) {
      pending.set(
        "Cookie",
        [...jar].map(([name, value]) => `${name}=${value}`).join("; "),
      );
    }
    const response = await pending
      .set(headers)
      .send({ query, variables })
      .expect(200);

    storeCookies(response.headers["set-cookie"]);
    return response.body as GraphQLResponse<TData>;
  }

  return {
    query: execute,
    mutation: execute,
    expectOk<TData>(response: GraphQLResponse<TData>) {
      if (response.errors?.length) {
        const summary = response.errors
          .map((error) => error.message)
          .join("; ");
        throw new Error(`GraphQL responded with errors: ${summary}`);
      }
    },
    cookies() {
      return Object.fromEntries(jar);
    },
    clearCookies() {
      jar.clear();
    },
  };
}
