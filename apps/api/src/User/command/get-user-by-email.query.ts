import { Query } from "@nestjs/cqrs";
import type { User } from "../user.entity";

export class GetUserByEmailQuery extends Query<User | null> {
  constructor(public readonly email: string) {
    super();
  }
}
