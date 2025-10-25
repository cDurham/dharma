import { ModuleMetadata } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

export interface OverrideProvider {
  provide: any;
  useValue: unknown;
}

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
