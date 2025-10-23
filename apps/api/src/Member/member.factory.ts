import { setSeederFactory } from "typeorm-extension";
import { Member } from ".";

export default setSeederFactory(Member, async (faker) => {
  const member = new Member();
  member.firstName = faker.person.firstName();
  member.joinDate = faker.date.past();
  member.lastName = faker.person.lastName();
  member.uuid = faker.string.uuid();
  return member;
});
