import { Global, Module, type OnApplicationShutdown } from "@nestjs/common";
import { closeConnections, db, readDb } from "./data-source.js";

export const DB_TOKEN = "DB_CONNECTION";
export const READ_DB_TOKEN = "READ_DB_CONNECTION";

const databaseProviders = [
  {
    provide: DB_TOKEN,
    useValue: db,
  },
  {
    provide: READ_DB_TOKEN,
    useValue: readDb,
  },
];

@Global()
@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule implements OnApplicationShutdown {
  // Pool sockets keep the event loop alive past app.close().
  async onApplicationShutdown(): Promise<void> {
    await closeConnections();
  }
}
