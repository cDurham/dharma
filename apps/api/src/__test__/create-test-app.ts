import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModuleBuilder } from "@nestjs/testing";
import cookieParser from "cookie-parser";
import { AppModule } from "../app.module.js";

export async function createTestApp(
  configure?: (builder: TestingModuleBuilder) => TestingModuleBuilder,
): Promise<INestApplication> {
  let builder = Test.createTestingModule({ imports: [AppModule] });
  if (configure) {
    builder = configure(builder);
  }
  const moduleFixture = await builder.compile();

  const app = moduleFixture.createNestApplication();
  // Mirrors src/index.ts: without cookie-parser, req.cookies is undefined
  // and the JWT cookie extractor silently sees no token.
  app.use(cookieParser(process.env.COOKIE_SECRET));
  await app.init();
  return app;
}
