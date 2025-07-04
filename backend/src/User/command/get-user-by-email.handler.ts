import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { GetUserByEmailQuery } from "./get-user-by-email.query";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../user.entity";

@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailHandler
  implements IQueryHandler<GetUserByEmailQuery>
{
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>
  ) {}

  async execute({ email }: GetUserByEmailQuery): Promise<User | null> {
    return this.userRepo.findOneBy({ email });
  }
}
