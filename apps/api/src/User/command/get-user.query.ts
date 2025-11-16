import { Query } from "@nestjs/cqrs";
import type { User } from "../user.entity";

export class GetUserQuery extends Query<User | null> {
  constructor(public readonly userUuid: string) {
    super();
  }
}
