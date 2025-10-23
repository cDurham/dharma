import { DataSource } from "typeorm";
import { Retreat } from "../Retreat";
import { prodDataSourceOptions } from "./data-source";

async function seed() {
  console.log("Seeding database...");
  const dataSource = new DataSource(prodDataSourceOptions);
  await dataSource.initialize();

  const retreatRepository = dataSource.getRepository(Retreat);
  const retreat = retreatRepository.create({
    name: "Test Retreat",
    startAt: new Date(),
    endAt: new Date(),
  });
  await retreatRepository.save(retreat);

  // additional seeding goes here
  console.log("Seeding complete");
  await dataSource.destroy();
}

seed().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
