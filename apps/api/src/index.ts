import "dotenv/config"; // Must be first!
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import "reflect-metadata";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Use cookie-parser middleware with signing secret
  const cookieSecret = process.env.COOKIE_SECRET;
  if (!cookieSecret) {
    throw new Error(
      "COOKIE_SECRET environment variable is required but not set",
    );
  }
  app.use(cookieParser(cookieSecret));
  const corsOptions = {
    origin: process.env.FRONTEND_URL || "http://localhost:4200",
    credentials: true,
  };
  app.enableCors(corsOptions);
  app.use(
    helmet({
      contentSecurityPolicy:
        process.env.NODE_ENV === "development"
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
