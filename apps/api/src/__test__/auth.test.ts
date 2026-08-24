import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { expectUnauthenticated, signUpAndLogin } from "./auth-helper.js";
import { createTestApp } from "./create-test-app.js";
import { createGraphQLClient, type GraphQLClient } from "./graphql-client.js";

const meQuery = `query Me {
    me {
      uuid
      email
    }
}`;

const refreshMutation = `mutation Refresh { refreshAccessToken }`;

describe("E2E - Auth enforcement", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("login sets access and refresh cookies", async () => {
    const graphql: GraphQLClient = createGraphQLClient(app);
    await signUpAndLogin(graphql);

    const cookies = graphql.cookies();
    expect(cookies.access_token).toBeTruthy();
    expect(cookies.refresh_token).toBeTruthy();
  });

  it("me returns the logged-in user with the cookie session", async () => {
    const graphql: GraphQLClient = createGraphQLClient(app);
    const user = await signUpAndLogin(graphql);

    const response = await graphql.query<{
      me: { uuid: string; email: string };
    }>({ query: meQuery });

    graphql.expectOk(response);
    expect(response.data.me.uuid).toBe(user.uuid);
    expect(response.data.me.email).toBe(user.email);
  });

  it("rejects guarded user operations without a session", async () => {
    const anonymous: GraphQLClient = createGraphQLClient(app);

    expectUnauthenticated(await anonymous.query({ query: meQuery }));
    expectUnauthenticated(
      await anonymous.query({
        query: `query Users { users { uuid } }`,
      }),
    );
    expectUnauthenticated(
      await anonymous.mutation({
        query: `mutation DeleteUser($uuid: String!) { deleteUser(uuid: $uuid) }`,
        variables: { uuid: "00000000-0000-0000-0000-000000000000" },
      }),
    );
  });

  it("rejects updateUser against another user's account", async () => {
    const graphql: GraphQLClient = createGraphQLClient(app);
    await signUpAndLogin(graphql);
    const other = await signUpAndLogin(createGraphQLClient(app));

    const response = await graphql.mutation({
      query: `mutation UpdateUser($uuid: String!, $data: UpdateUserInput!) {
          updateUser(uuid: $uuid, data: $data) {
            uuid
          }
      }`,
      variables: { uuid: other.uuid, data: { firstName: "Hijacked" } },
    });

    expect(response.errors?.[0]?.extensions?.code).toBe("FORBIDDEN");
  });

  it("logout clears the session", async () => {
    const graphql: GraphQLClient = createGraphQLClient(app);
    await signUpAndLogin(graphql);

    const logout = await graphql.mutation<{ logout: boolean }>({
      query: `mutation Logout { logout }`,
    });
    graphql.expectOk(logout);
    expect(logout.data.logout).toBe(true);
    expect(graphql.cookies()).toEqual({});

    expectUnauthenticated(await graphql.query({ query: meQuery }));
  });

  it("keeps public REST routes reachable", async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    const health = await request(server).get("/health").expect(200);
    expect(health.body.status).toBe("ok");

    // 302, not 401: the global guard honors class-level @Public on REST.
    await request(server).get("/verify?token=not-a-real-token").expect(302);
  });

  it("rotates the refresh token and revokes the presented one", async () => {
    const graphql: GraphQLClient = createGraphQLClient(app);
    await signUpAndLogin(graphql);
    const oldRefreshToken = graphql.cookies().refresh_token;

    const refreshed = await graphql.mutation<{ refreshAccessToken: boolean }>({
      query: refreshMutation,
    });
    graphql.expectOk(refreshed);
    expect(refreshed.data.refreshAccessToken).toBe(true);
    expect(graphql.cookies().refresh_token).not.toBe(oldRefreshToken);

    const replayed = await graphql.mutation({
      query: refreshMutation,
      headers: { Cookie: `refresh_token=${oldRefreshToken}` },
    });
    expect(replayed.errors?.[0]?.message).toBe("Invalid refresh token");
    expect(replayed.errors?.[0]?.extensions?.code).toBe("UNAUTHENTICATED");
  });
});
