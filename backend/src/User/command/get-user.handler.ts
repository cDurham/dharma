import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../user.entity";
import { GetUserQuery } from "./get-user.query";

@QueryHandler(GetUserQuery)
export class GetUserHandler
  implements IQueryHandler<GetUserQuery, User | null>
{
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>
  ) {}

  async execute({ userUuid }: GetUserQuery) {
    const user = await this.userRepo.findOneBy({ uuid: userUuid });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }
}
