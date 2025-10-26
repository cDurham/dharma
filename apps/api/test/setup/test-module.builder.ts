import { ModuleMetadata, Type } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { CommandBus, EventBus, QueryBus } from "@nestjs/cqrs";
import { ConfigService } from "@nestjs/config";
import { MailerService } from "@nestjs-modules/mailer";
import { DB_TOKEN } from "../../src/db/database.module";
import { KafkaService } from "../../src/kafka/kafka.service";
import { createMockDb, MockDb } from "../mocks/database.mock";
import { createMockKafkaService, MockKafkaService } from "../mocks/kafka.mock";
import { createMockEventBus, MockEventBus } from "../mocks/event-bus.mock";
import { createMockCommandBus, MockCommandBus } from "../mocks/command-bus.mock";
import { createMockQueryBus, MockQueryBus } from "../mocks/query-bus.mock";
import { createMockConfigService, MockConfigService } from "../mocks/config.mock";
import { createMockMailerService, MockMailerService } from "../mocks/mailer.mock";

export interface OverrideProvider {
  provide: any;
  useValue: unknown;
}

export interface TestMocks {
  db?: MockDb;
  kafka?: MockKafkaService;
  eventBus?: MockEventBus;
  commandBus?: MockCommandBus;
  queryBus?: MockQueryBus;
  config?: MockConfigService;
  mailer?: MockMailerService;
}

export interface TestBuilderResult<T = any> {
  moduleRef: TestingModule;
  handler?: T;
  mocks: TestMocks;
}

/**
 * Fluent builder for creating NestJS test modules with common mocks
 * 
 * @example
 * // For testing command handlers
 * const { handler, mocks } = await TestBuilder
 *   .forHandler(CreateMemberHandler)
 *   .withMockDb()
 *   .withMockEventBus()
 *   .build();
 * 
 * @example
 * // For integration tests
 * const { moduleRef, mocks } = await TestBuilder
 *   .forModule(MemberModule)
 *   .withMockDb()
 *   .withMockKafka()
 *   .build();
 */
export class TestBuilder<T = any> {
  private metadata: ModuleMetadata = { providers: [] };
  private overrides: OverrideProvider[] = [];
  private mocks: TestMocks = {};
  private handlerClass?: Type<T>;

  private constructor() {}

  /**
   * Create a test module for a command/query handler
   */
  static forHandler<H>(handlerClass: Type<H>): TestBuilder<H> {
    const builder = new TestBuilder<H>();
    builder.handlerClass = handlerClass;
    builder.metadata.providers = [handlerClass];
    return builder;
  }

  /**
   * Create a test module for a NestJS module (integration tests)
   */
  static forModule<M>(moduleClass: Type<M>): TestBuilder {
    const builder = new TestBuilder();
    builder.metadata.imports = [moduleClass];
    return builder;
  }

  /**
   * Add mock database
   */
  withMockDb(): this {
    this.mocks.db = createMockDb();
    
    // Add to providers list for forHandler, or to overrides for forModule
    if (!this.metadata.providers) {
      this.metadata.providers = [];
    }
    this.metadata.providers.push({
      provide: DB_TOKEN,
      useValue: this.mocks.db,
    });
    
    // Also add to overrides in case it's a module test
    this.overrides.push({
      provide: DB_TOKEN,
      useValue: this.mocks.db,
    });
    return this;
  }

  /**
   * Add mock Kafka service
   */
  withMockKafka(): this {
    this.mocks.kafka = createMockKafkaService();
    
    if (!this.metadata.providers) {
      this.metadata.providers = [];
    }
    this.metadata.providers.push({
      provide: KafkaService,
      useValue: this.mocks.kafka,
    });
    
    this.overrides.push({
      provide: KafkaService,
      useValue: this.mocks.kafka,
    });
    return this;
  }

  /**
   * Add mock EventBus
   */
  withMockEventBus(): this {
    this.mocks.eventBus = createMockEventBus();
    
    if (!this.metadata.providers) {
      this.metadata.providers = [];
    }
    this.metadata.providers.push({
      provide: EventBus,
      useValue: this.mocks.eventBus,
    });
    
    this.overrides.push({
      provide: EventBus,
      useValue: this.mocks.eventBus,
    });
    return this;
  }

  /**
   * Add mock CommandBus
   */
  withMockCommandBus(): this {
    this.mocks.commandBus = createMockCommandBus();
    
    if (!this.metadata.providers) {
      this.metadata.providers = [];
    }
    this.metadata.providers.push({
      provide: CommandBus,
      useValue: this.mocks.commandBus,
    });
    
    this.overrides.push({
      provide: CommandBus,
      useValue: this.mocks.commandBus,
    });
    return this;
  }

  /**
   * Add mock QueryBus
   */
  withMockQueryBus(): this {
    this.mocks.queryBus = createMockQueryBus();
    
    if (!this.metadata.providers) {
      this.metadata.providers = [];
    }
    this.metadata.providers.push({
      provide: QueryBus,
      useValue: this.mocks.queryBus,
    });
    
    this.overrides.push({
      provide: QueryBus,
      useValue: this.mocks.queryBus,
    });
    return this;
  }

  /**
   * Add mock ConfigService
   */
  withMockConfig(): this {
    this.mocks.config = createMockConfigService();
    
    if (!this.metadata.providers) {
      this.metadata.providers = [];
    }
    this.metadata.providers.push({
      provide: ConfigService,
      useValue: this.mocks.config,
    });
    
    this.overrides.push({
      provide: ConfigService,
      useValue: this.mocks.config,
    });
    return this;
  }

  /**
   * Add mock MailerService
   */
  withMockMailer(): this {
    this.mocks.mailer = createMockMailerService();
    
    if (!this.metadata.providers) {
      this.metadata.providers = [];
    }
    this.metadata.providers.push({
      provide: MailerService,
      useValue: this.mocks.mailer,
    });
    
    this.overrides.push({
      provide: MailerService,
      useValue: this.mocks.mailer,
    });
    return this;
  }

  /**
   * Add custom provider override
   */
  withMockProvider(provide: any, useValue: any): this {
    this.overrides.push({ provide, useValue });
    return this;
  }

  /**
   * Build and compile the test module
   */
  async build(): Promise<TestBuilderResult<T>> {
    const moduleBuilder = Test.createTestingModule(this.metadata);

    this.overrides.forEach(({ provide, useValue }) => {
      moduleBuilder.overrideProvider(provide).useValue(useValue);
    });

    const moduleRef = await moduleBuilder.compile();

    const result: TestBuilderResult<T> = {
      moduleRef,
      mocks: this.mocks,
    };

    if (this.handlerClass) {
      result.handler = moduleRef.get(this.handlerClass);
    }

    return result;
  }
}

/**
 * Legacy helper function for backward compatibility
 * @deprecated Use TestBuilder.forModule() instead
 */
export const createTestingModule = async (
  metadata: ModuleMetadata,
  overrides: OverrideProvider[] = []
): Promise<TestingModule> => {
  const moduleBuilder = Test.createTestingModule(metadata);

  overrides.forEach(({ provide, useValue }) => {
    moduleBuilder.overrideProvider(provide).useValue(useValue);
  });

  return moduleBuilder.compile();
};
