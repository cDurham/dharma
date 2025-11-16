import { Query } from "@nestjs/cqrs";
import type { User } from "../user.entity";

export class GetUsersQuery extends Query<User[]> {}
