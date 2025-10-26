export default {
  displayName: 'api',
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/test/setup/test-db.setup.ts'],
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    }]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/api',
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/**/*.spec.ts',
    '!src/**/__tests__/**'
  ],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(@faker-js)/)',
  ],
  moduleNameMapper: {
    '^@api/(.*)$': '<rootDir>/src/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
    '^@mocks/(.*)$': '<rootDir>/test/mocks/$1',
    '^@fixtures/(.*)$': '<rootDir>/test/fixtures/$1',
  },
};
