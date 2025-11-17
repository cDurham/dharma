import { Query } from "@nestjs/cqrs";
import type { UserEntity } from "../user.entity.js";

export class GetUsersQuery extends Query<UserEntity[]> {}
