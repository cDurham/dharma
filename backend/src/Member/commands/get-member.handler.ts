import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Member } from "../member.entity";
import { GetMemberQuery } from "./get-member.query";

@QueryHandler(GetMemberQuery)
export class GetMemberHandler implements IQueryHandler<GetMemberQuery> {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>
  ) {}

  async execute({ memberUuid }: GetMemberQuery): Promise<Member | null> {
    return this.memberRepo.findOneBy({ uuid: memberUuid });
  }
}
