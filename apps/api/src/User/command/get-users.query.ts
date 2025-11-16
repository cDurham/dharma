import { Query } from "@nestjs/cqrs";
import type { User } from "../user.entity.js";

export class GetUsersQuery extends Query<User[]> {}
