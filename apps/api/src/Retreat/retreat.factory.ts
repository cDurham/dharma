import { setSeederFactory } from "typeorm-extension";
import { Retreat } from "./retreat.entity";

export default setSeederFactory(Retreat, async (faker) => {
  const retreat = new Retreat();
  retreat.name = faker.company.catchPhrase();
  retreat.createdAt = new Date();
  retreat.startAt = faker.date.soon();
  retreat.endAt = faker.date.future();
  return retreat;
});
