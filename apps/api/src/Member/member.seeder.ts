import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { DataSource } from "typeorm";
import { Member } from ".";

interface IMemberSeederOptions {
  numSeeds: number;
}

export default class MemberSeeder implements Seeder {
  track = false;
  private options: IMemberSeederOptions;

  constructor(options: IMemberSeederOptions) {
    const defaultOptions: IMemberSeederOptions = {
      numSeeds: 5,
    };

    const optionsWithDefaults = Object.assign(defaultOptions, options);
    this.options = optionsWithDefaults;
  }

  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<any> {
    const memberFactory = factoryManager.get(Member);
    // test specific seeds
    memberFactory.save({
      uuid: "e2b752c2-3ae1-44fe-a70e-4e9b677a5e44",
    });

    // random seeds
    await memberFactory.saveMany(4);
  }
}
