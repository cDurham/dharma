import "reflect-metadata";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const currentDir = dirname(fileURLToPath(import.meta.url));

const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: currentDir,
  collectCoverageFrom: ["src/**/*.(t|j)s"],
  coverageDirectory: join(currentDir, "../../coverage/api"),
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
};

export default config;
