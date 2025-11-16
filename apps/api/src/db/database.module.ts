import { Global, Module } from "@nestjs/common";
import { db, readDb } from "./data-source";

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
export class DatabaseModule {}
