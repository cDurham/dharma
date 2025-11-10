import { faker } from "@faker-js/faker";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../app.module";

interface GraphQLResponse<T> {
  data: T;
}

interface Retreat {
  uuid: string;
  name: string;
  startAt: string;
  endAt: string;
}

describe("E2E - Retreat Resolver", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
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

    const response = await request(app.getHttpServer())
      .post("/graphql")
      .send({ query: createRetreatMutation, variables })
      .expect(200);

    const body = response.body as GraphQLResponse<{ createRetreat: Retreat }>;
    expect(body.data.createRetreat.startAt).toEqual(
      variables.data.startAt.toISOString()
    );
    expect(body.data.createRetreat.endAt).toEqual(
      variables.data.endAt.toISOString()
    );
    expect(body.data.createRetreat.name).toEqual(variables.data.name);
    expect(body.data.createRetreat.uuid).toBeDefined();
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

    const response = await request(app.getHttpServer())
      .post("/graphql")
      .send({ query: retreatsQuery })
      .expect(200);

    const body = response.body as GraphQLResponse<{ retreats: Retreat[] }>;
    expect(body.data.retreats).toBeInstanceOf(Array);
    body.data.retreats.forEach((retreat) => {
      expect(typeof retreat.name).toBe("string");
      expect(typeof retreat.startAt).toBe("string");
      expect(typeof retreat.endAt).toBe("string");
    });
  });
});
