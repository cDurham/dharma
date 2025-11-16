import type { Person } from "./person.entity.js";

export class PersonInput implements Partial<Person> {
  firstName!: string;
  lastName!: string;
}

export class UpdatePersonInput implements Partial<Person> {
  firstName?: string;
  lastName?: string;
}
