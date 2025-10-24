import { faker } from "@faker-js/faker";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { runSeeders } from "typeorm-extension";
import { AppModule } from "../app.module";
import { AppDataSource } from "../db/data-source";
import { Retreat } from "../Retreat/retreat.entity";

describe("E2E - Retreat Resolver", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await AppDataSource.initialize();
    await app.init();
    await runSeeders(AppDataSource);
  });

  afterEach(async () => {
    const retreatRepo = AppDataSource.getRepository(Retreat);
    await retreatRepo.clear();
  });

  afterAll(async () => {
    await AppDataSource.destroy();
    await app.close(); // is this needed at all?
  });

  it("/create retreat", async () => {
    const createRetreatMutation = `mutation createRetreat($data: CreateRetreatInput!) {
        createRetreat(data: $data) {
            name
            start_at
            end_at
        }
    }`;

    const variables = {
      data: {
        name: faker.company.catchPhrase(),
        start_at: faker.date.past(),
        end_at: faker.date.future(),
      },
    };

    return request(app.getHttpServer())
      .post("/graphql")
      .send({ query: createRetreatMutation, variables })
      .expect(200)
      .then((response) => {
        expect(response.body.data.createRetreat.start_at).toEqual(
          variables.data.start_at.toISOString()
        );
        expect(response.body.data.createRetreat.end_at).toEqual(
          variables.data.end_at.toISOString()
        );
        expect(response.body.data.createRetreat.name).toEqual(
          variables.data.name
        );
        expect(response.body.data.createRetreat.uuid).toBeDefined();
      });
  });

  it("/retreats", async () => {
    const retreatsQuery = `query retreats {
        retreats {
            name
            start_at
            end_at
        }
    }`;
    return request(app.getHttpServer())
      .post("/graphql")
      .send({ query: retreatsQuery })
      .expect(200)
      .then((response) => {
        expect(response.body.data.retreats).toBeInstanceOf(Array);
        response.body.data.retreats.forEach((retreat: any) => {
          expect(typeof retreat.name).toBe("string");
          expect(typeof retreat.start_at).toBe("string");
          expect(typeof retreat.end_at).toBe("string");
        });
      });
  });
});
