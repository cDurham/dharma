import { Global, Module, type OnApplicationShutdown } from "@nestjs/common";
import { closeConnections, db } from "./data-source.js";

export const DB_TOKEN = "DB_CONNECTION";

@Global()
@Module({
  providers: [
    {
      provide: DB_TOKEN,
      useValue: db,
    },
  ],
  exports: [DB_TOKEN],
})
export class DatabaseModule implements OnApplicationShutdown {
  // Pool sockets keep the event loop alive past app.close().
  async onApplicationShutdown(): Promise<void> {
    await closeConnections();
  }
}
