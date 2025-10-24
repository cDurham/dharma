import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Member } from "../member.entity";
import { GetMembersQuery } from "./get-members.query";

@QueryHandler(GetMembersQuery)
export class GetMembersHandler implements IQueryHandler<GetMembersQuery> {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>
  ) {}

  async execute(): Promise<Member[]> {
    return this.memberRepo.find();
  }
}
