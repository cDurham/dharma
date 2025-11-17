import { Query } from "@nestjs/cqrs";
import type { UserEntity } from "../user.entity.js";

export class GetUserQuery extends Query<UserEntity | null> {
  constructor(public readonly userUuid: string) {
    super();
  }
}
