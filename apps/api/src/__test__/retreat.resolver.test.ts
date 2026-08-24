import { faker } from "@faker-js/faker";
import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { AppModule } from "../app.module.js";
import { createGraphQLClient, type GraphQLClient } from "./graphql-client.js";

interface Retreat {
  uuid: string;
  name: string;
  startAt: string;
  endAt: string;
}

describe("E2E - Retreat Resolver", () => {
  let app: INestApplication;
  let graphql: GraphQLClient;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    graphql = createGraphQLClient(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it("/create retreat", async () => {
    const createRetreatMutation = `mutation createRetreat($data: CreateRetreatInput!) {
        createRetreat(data: $data) {
            uuid
            name
            startAt
            endAt
        }
    }`;

    const variables = {
      data: {
        name: faker.company.catchPhrase(),
        startAt: faker.date.past(),
        endAt: faker.date.future(),
      },
    };

    const response = await graphql.mutation<
      { createRetreat: Retreat },
      typeof variables
    >({
      query: createRetreatMutation,
      variables,
    });

    graphql.expectOk(response);
    expect(response.data.createRetreat.startAt).toEqual(
      variables.data.startAt.toISOString(),
    );
    expect(response.data.createRetreat.endAt).toEqual(
      variables.data.endAt.toISOString(),
    );
    expect(response.data.createRetreat.name).toEqual(variables.data.name);
    expect(response.data.createRetreat.uuid).toBeDefined();
  });

  it("/retreats", async () => {
    const retreatsQuery = `query retreats {
        retreats {
            uuid
            name
            startAt
            endAt
        }
    }`;

    const response = await graphql.query<{ retreats: Retreat[] }>({
      query: retreatsQuery,
    });

    graphql.expectOk(response);
    expect(response.data.retreats).toBeInstanceOf(Array);
    response.data.retreats.forEach((retreat) => {
      expect(typeof retreat.name).toBe("string");
      expect(typeof retreat.startAt).toBe("string");
      expect(typeof retreat.endAt).toBe("string");
    });
  });
});
