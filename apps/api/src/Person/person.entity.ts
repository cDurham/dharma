/**
 * Person entity - GraphQL abstraction only
 * Not backed by a database table (using concrete table inheritance)
 */
export class Person {
  uuid!: string;
  firstName!: string;
  lastName!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
