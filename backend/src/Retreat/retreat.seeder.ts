import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { Retreat } from "./retreat.entity";

export default class RetreatSeeder implements Seeder {
  track = false;

  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<any> {
    const retreatFactory = factoryManager.get(Retreat);
    // test specific seeds
    retreatFactory.save({
      uuid: "e2b752c2-3ae1-44fe-a70e-4e9b677a5e44",
    });

    // random seeds
    await retreatFactory.saveMany(4);
  }
}
