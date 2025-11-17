import { Query } from "@nestjs/cqrs";
import type { UserEntity } from "../user.entity.js";

export class GetUserByEmailQuery extends Query<UserEntity | null> {
  constructor(public readonly email: string) {
    super();
  }
}
