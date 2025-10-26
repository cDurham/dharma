# Testing Guide

This guide explains how to write tests in the API application using our testing infrastructure.

## Table of Contents

- [Path Aliases](#path-aliases)
- [Barrel Exports](#barrel-exports)
- [TestBuilder API](#testbuilder-api)
- [Migration Examples](#migration-examples)
- [Best Practices](#best-practices)

## Path Aliases

We provide several path aliases to eliminate deep relative imports:

### Available Aliases

| Alias | Maps To | Use For |
|-------|---------|---------|
| `@api/*` | `apps/api/src/*` | Source code imports |
| `@test/*` | `apps/api/test/*` | Test utilities root |
| `@mocks/*` | `apps/api/test/mocks/*` | Mock factories |
| `@fixtures/*` | `apps/api/test/fixtures/*` | Test fixtures |

### Usage

```typescript
// ❌ Old way - deep relative paths
import { createMockDb } from '../../../../test/mocks/database.mock';
import { createMemberFixture } from '../../../../test/fixtures/member.fixture';

// ✅ New way - clean path aliases
import { createMockDb } from '@mocks/database.mock';
import { createMemberFixture } from '@fixtures/member.fixture';
```

## Barrel Exports

Barrel exports allow you to import multiple related utilities from a single import statement.

### Available Barrels

#### Mocks Barrel (`@test/mocks`)

```typescript
import {
  createMockDb, MockDb,
  createMockKafkaService, MockKafkaService,
  createMockEventBus, MockEventBus,
  createMockCommandBus, MockCommandBus,
  createMockQueryBus, MockQueryBus,
  createMockConfigService, MockConfigService,
  createMockMailerService, MockMailerService,
} from '@test/mocks';
```

#### Fixtures Barrel (`@test/fixtures`)

```typescript
import {
  createMemberFixture,
  createRetreatFixture,
  createUserFixture,
  createAuthFixture,
} from '@test/fixtures';
```

#### Complete Test Utilities (`@test`)

```typescript
// Import everything at once
import {
  TestBuilder,
  createMockDb,
  createMemberFixture,
  // ... all mocks and fixtures
} from '@test';
```

## TestBuilder API

The `TestBuilder` provides a fluent API for creating test modules with common mocks pre-configured.

### For Command/Query Handlers (Unit Tests)

Perfect for testing CQRS handlers in isolation:

```typescript
import { TestBuilder } from '@test/setup/test-module.builder';
import { CreateMemberHandler } from './create-member.handler';

describe('CreateMemberHandler', () => {
  let handler: CreateMemberHandler;
  let mockDb: MockDb;
  let mockEventBus: MockEventBus;

  beforeEach(async () => {
    const { handler: builtHandler, mocks } = await TestBuilder
      .forHandler(CreateMemberHandler)
      .withMockDb()
      .withMockEventBus()
      .build();

    handler = builtHandler!;
    mockDb = mocks.db!;
    mockEventBus = mocks.eventBus!;
  });

  it('should create a member', async () => {
    // Test implementation
  });
});
```

### For NestJS Modules (Integration Tests)

Great for testing module interactions:

```typescript
import { TestBuilder } from '@test/setup/test-module.builder';
import { MemberModule } from './member.module';

describe('MemberModule Integration', () => {
  let moduleRef: TestingModule;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const result = await TestBuilder
      .forModule(MemberModule)
      .withMockDb()
      .withMockKafka()
      .build();

    moduleRef = result.moduleRef;
    commandBus = moduleRef.get(CommandBus);
  });
});
```

### Available Builder Methods

| Method | Provides | Token/Class |
|--------|----------|-------------|
| `.withMockDb()` | Mock database | `DB_TOKEN` |
| `.withMockKafka()` | Mock Kafka service | `KafkaService` |
| `.withMockEventBus()` | Mock CQRS event bus | `EventBus` |
| `.withMockCommandBus()` | Mock CQRS command bus | `CommandBus` |
| `.withMockQueryBus()` | Mock CQRS query bus | `QueryBus` |
| `.withMockConfig()` | Mock config service | `ConfigService` |
| `.withMockMailer()` | Mock mailer service | `MailerService` |
| `.withMockProvider(token, value)` | Custom provider | Any |

### Method Chaining

All methods return `this` for fluent chaining:

```typescript
const { handler, mocks } = await TestBuilder
  .forHandler(EmailService)
  .withMockConfig()
  .withMockMailer()
  .withMockProvider(SomeService, mockSomeService)
  .build();
```

## Migration Examples

### Example 1: Unit Test Migration

**Before:**
```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { EventBus } from "@nestjs/cqrs";
import { DB_TOKEN } from "../../../db/database.module";
import { CreateMemberHandler } from "./create-member.handler";
import { createMockDb, MockDb } from "../../../../test/mocks/database.mock";
import { createMockEventBus, MockEventBus } from "../../../../test/mocks/event-bus.mock";
import { createMemberFixture } from "../../../../test/fixtures/member.fixture";

describe("CreateMemberHandler", () => {
  let handler: CreateMemberHandler;
  let mockDb: MockDb;
  let mockEventBus: MockEventBus;
  let moduleRef: TestingModule;

  beforeEach(async () => {
    mockDb = createMockDb();
    mockEventBus = createMockEventBus();

    moduleRef = await Test.createTestingModule({
      providers: [
        CreateMemberHandler,
        { provide: DB_TOKEN, useValue: mockDb },
        { provide: EventBus, useValue: mockEventBus },
      ],
    }).compile();

    handler = moduleRef.get(CreateMemberHandler);
  });

  afterEach(async () => {
    if (moduleRef) {
      await moduleRef.close();
    }
  });

  // tests...
});
```

**After:**
```typescript
import { TestBuilder } from "@test/setup/test-module.builder";
import { MockDb, MockEventBus } from "@test/mocks";
import { createMemberFixture } from "@fixtures/member.fixture";
import { CreateMemberHandler } from "./create-member.handler";

describe("CreateMemberHandler", () => {
  let handler: CreateMemberHandler;
  let mockDb: MockDb;
  let mockEventBus: MockEventBus;

  beforeEach(async () => {
    const { handler: builtHandler, mocks } = await TestBuilder
      .forHandler(CreateMemberHandler)
      .withMockDb()
      .withMockEventBus()
      .build();

    handler = builtHandler!;
    mockDb = mocks.db!;
    mockEventBus = mocks.eventBus!;
  });

  // tests...
});
```

### Example 2: Integration Test Migration

**Before:**
```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { CommandBus } from "@nestjs/cqrs";
import { MemberModule } from "../../member.module";
import { DB_TOKEN, DatabaseModule } from "../../../db/database.module";
import { createMockDb, MockDb } from "../../../../test/mocks/database.mock";
import { createMockKafkaService, MockKafkaService } from "../../../../test/mocks/kafka.mock";
import { KafkaService } from "../../../kafka/kafka.service";

describe("MemberModule", () => {
  let moduleRef: TestingModule;
  let mockDb: MockDb;
  let mockKafka: MockKafkaService;

  beforeEach(async () => {
    mockDb = createMockDb();
    mockKafka = createMockKafkaService();

    moduleRef = await Test.createTestingModule({
      imports: [MemberModule, DatabaseModule],
    })
      .overrideProvider(DB_TOKEN).useValue(mockDb)
      .overrideProvider(KafkaService).useValue(mockKafka)
      .compile();
  });

  // tests...
});
```

**After (Option 1: Using barrel imports only):**
```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { CommandBus } from "@nestjs/cqrs";
import { MemberModule } from "../../member.module";
import { DB_TOKEN, DatabaseModule } from "../../../db/database.module";
import { KafkaService } from "../../../kafka/kafka.service";
import { createMockDb, MockDb, createMockKafkaService, MockKafkaService } from "@test/mocks";

describe("MemberModule", () => {
  let moduleRef: TestingModule;
  let mockDb: MockDb;
  let mockKafka: MockKafkaService;

  beforeEach(async () => {
    mockDb = createMockDb();
    mockKafka = createMockKafkaService();

    moduleRef = await Test.createTestingModule({
      imports: [MemberModule, DatabaseModule],
    })
      .overrideProvider(DB_TOKEN).useValue(mockDb)
      .overrideProvider(KafkaService).useValue(mockKafka)
      .compile();
  });

  // tests...
});
```

**After (Option 2: Using TestBuilder - if you want less boilerplate):**
```typescript
import { CommandBus } from "@nestjs/cqrs";
import { MemberModule } from "../../member.module";
import { DatabaseModule } from "../../../db/database.module";
import { TestBuilder } from "@test/setup/test-module.builder";
import { MockDb, MockKafkaService } from "@test/mocks";

describe("MemberModule", () => {
  let moduleRef: TestingModule;
  let mockDb: MockDb;
  let mockKafka: MockKafkaService;

  beforeEach(async () => {
    const result = await TestBuilder
      .forModule(MemberModule)
      .withMockDb()
      .withMockKafka()
      .build();

    moduleRef = result.moduleRef;
    mockDb = result.mocks.db!;
    mockKafka = result.mocks.kafka!;
  });

  // tests...
});
```

## Best Practices

### 1. Choose the Right Tool for the Job

- **Simple unit tests**: Use barrel imports (`@test/mocks`) with manual `Test.createTestingModule()`
- **Handler tests**: Use `TestBuilder.forHandler()` for clean, consistent setup
- **Integration tests**: Use `TestBuilder.forModule()` or manual setup, depending on complexity

### 2. Import Patterns

```typescript
// ✅ Good - specific imports
import { createMockDb, MockDb } from '@mocks/database.mock';

// ✅ Good - barrel import for multiple mocks
import { createMockDb, createMockKafkaService, MockDb, MockKafkaService } from '@test/mocks';

// ✅ Good - fixtures from barrel
import { createMemberFixture, createUserFixture } from '@test/fixtures';

// ❌ Avoid - unnecessary nesting
import { MockDb } from '@test/mocks/database.mock';
```

### 3. TestBuilder vs Manual Setup

**Use TestBuilder when:**
- Testing command/query handlers
- You need multiple common mocks
- You want consistent test structure across your codebase

**Use manual setup when:**
- You need fine-grained control over module configuration
- Testing edge cases with custom provider configurations
- The test is simple and builder adds unnecessary abstraction

### 4. Gradual Migration

You don't need to migrate all tests at once:

1. **New tests**: Use the new patterns from day one
2. **Existing tests**: Migrate as you touch them
3. **Priority**: Focus on tests you frequently modify

### 5. Type Safety

Always use the exported TypeScript interfaces for mocks:

```typescript
import { MockDb, MockEventBus } from '@test/mocks';

// ✅ Good - typed mocks
let mockDb: MockDb;
let mockEventBus: MockEventBus;

// ❌ Avoid - untyped
let mockDb: any;
```

## FAQ

### Q: Can I still use relative imports?

**A:** Yes! The path aliases are optional. Existing tests with relative imports will continue to work.

### Q: Do I need to use TestBuilder?

**A:** No, it's optional. It's most beneficial for handler tests and integration tests with multiple mocks.

### Q: How do I add a new mock?

**A:** 
1. Create the mock file in `test/mocks/`
2. Export it from `test/mocks/index.ts`
3. Optionally add a builder method in `TestBuilder`

### Q: Can I use TestBuilder with custom modules?

**A:** Yes! Use `.forModule(YourModule)` and chain any builder methods you need.

### Q: What if I need a mock that's not in TestBuilder?

**A:** Use `.withMockProvider(token, mockValue)` to add custom mocks.

## Examples in the Codebase

Check out these files for real-world examples:

- `src/Member/__tests__/unit/create-member.handler.spec.ts` - TestBuilder for handler
- `src/Member/__tests__/integration/member.module.spec.ts` - Barrel imports
- `src/Email/__tests__/unit/email.service.spec.ts` - Manual setup with clean imports

---

**Need help?** Review the tests mentioned above or ask the team!

