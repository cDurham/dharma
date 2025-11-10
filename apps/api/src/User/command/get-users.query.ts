import { Query } from "@nestjs/cqrs";
import { User } from "../user.entity";

export class GetUsersQuery extends Query<User[]> {}
