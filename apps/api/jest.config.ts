import 'reflect-metadata';
import { join } from 'path';

const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: __dirname,
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: join(__dirname, '../../coverage/api'),
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  }
};

export default config;
