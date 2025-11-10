import { INestApplication } from "@nestjs/common";
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
    options: GraphQLOperationOptions<TVariables>
  ): Promise<GraphQLResponse<TData>>;
  mutation<TData, TVariables = Record<string, unknown>>(
    options: GraphQLOperationOptions<TVariables>
  ): Promise<GraphQLResponse<TData>>;
  expectOk<TData>(
    response: GraphQLResponse<TData>
  ): asserts response is GraphQLSuccess<TData>;
}

export interface GraphQLOperationOptions<TVariables> {
  query: string;
  variables?: TVariables;
  headers?: Record<string, string>;
}

export function createGraphQLClient(app: INestApplication): GraphQLClient {
  const agent = request(app.getHttpServer() as Parameters<typeof request>[0]);

  async function execute<TData, TVariables>({
    query,
    variables,
    headers = {},
  }: GraphQLOperationOptions<TVariables>): Promise<GraphQLResponse<TData>> {
    const response = await agent
      .post("/graphql")
      .set(headers)
      .send({ query, variables })
      .expect(200);

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
  };
}
