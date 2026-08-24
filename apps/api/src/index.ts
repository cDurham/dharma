import "dotenv/config"; // Must be first!
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import "reflect-metadata";
import { AppModule } from "./app.module.js";
import { appConfig } from "./config/app.config.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser(appConfig.cookieSecret));
  const corsOptions = {
    origin: appConfig.frontendUrl,
    credentials: true,
  };
  app.enableCors(corsOptions);
  app.use(
    helmet({
      contentSecurityPolicy:
        appConfig.nodeEnv === "development"
          ? {
              directives: {
                "script-src": [
                  "'self'",
                  "'unsafe-inline'",
                  "localhost:4200",
                  "cdn.jsdelivr.net",
                ],
                "img-src": [
                  "'self'",
                  "data:",
                  "localhost:4200",
                  "cdn.jsdelivr.net",
                ],
                "connect-src": ["'self'", "localhost:4200"],
              },
            }
          : true,
    }),
  );

  await app.listen(3000);
}

bootstrap().catch((err) => {
  console.error("Data Source Initialization Error", err);
});
