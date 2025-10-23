import { DataSourceOptions, DataSource } from "typeorm";
import { RefreshToken } from "../Auth/refresh-token.entity";
import { Member } from "../Member";
import { Retreat } from "../Retreat";
import { User } from "../User";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

const baseDataSourceOptions: DataSourceOptions = {
  database: process.env.DB_DATABASE,
  entities: [Member, Retreat, User, RefreshToken],
  logger: "advanced-console",
  synchronize: process.env.NODE_ENV !== "production", // Only true for development
  dropSchema: process.env.NODE_ENV !== "production", // Drop schema in development
  type: "postgres",
};

const readWriteSplitStrategy: Pick<PostgresConnectionOptions, "replication"> = {
  replication: {
    master: {
      host: process.env.DB_WRITE_HOST,
      port: process.env.DB_WRITE_PORT
        ? parseInt(process.env.DB_WRITE_PORT, 10)
        : 5432,
      password: process.env.DB_WRITE_PASSWORD,
      username: process.env.DB_WRITE_USER,
    },
    slaves: [
      {
        host: process.env.DB_READ_HOST,
        port: process.env.DB_READ_PORT
          ? parseInt(process.env.DB_READ_PORT, 10)
          : 5432,
        password: process.env.DB_READ_PASSWORD,
        username: process.env.DB_READ_USER,
      },
    ],
  },
};

export const prodDataSourceOptions: DataSourceOptions = {
  ...baseDataSourceOptions,
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  username: process.env.DB_USER,
};

export const AppDataSource = new DataSource(prodDataSourceOptions);
