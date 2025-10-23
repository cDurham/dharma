import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../user.entity";
import { GetUsersQuery } from "./get-users.query";

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async execute(): Promise<User[]> {
    return this.userRepo.find();
  }
}
