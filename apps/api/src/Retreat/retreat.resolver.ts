import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CreateRetreatCommand } from "./commands/create-retreat.command.js";
import { DeleteRetreatCommand } from "./commands/delete-retreat.command.js";
import { GetRetreatQuery } from "./commands/get-retreat.query.js";
import { GetRetreatsQuery } from "./commands/get-retreats.query.js";
import { UpdateRetreatCommand } from "./commands/update-retreat.command.js";
import { Retreat } from "./retreat.entity.js";
import type {
  CreateRetreatInput,
  UpdateRetreatInput,
} from "./retreat.input.js";

@Resolver(() => Retreat)
export class RetreatResolver {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Query(() => Retreat)
  async retreat(@Args("uuid") uuid: string): Promise<Retreat | null> {
    const result = await this.queryBus.execute(new GetRetreatQuery(uuid));
    return result;
  }

  @Query(() => [Retreat])
  async retreats(): Promise<Retreat[]> {
    const result = await this.queryBus.execute(new GetRetreatsQuery());
    return result;
  }

  @Mutation(() => Retreat)
  async createRetreat(
    @Args("data") data: CreateRetreatInput,
  ): Promise<Retreat> {
    const result = await this.commandBus.execute(
      new CreateRetreatCommand(data),
    );
    return result;
  }

  @Mutation(() => Retreat)
  async updateRetreat(
    @Args("uuid") uuid: string,
    @Args("data") data: UpdateRetreatInput,
  ): Promise<Retreat | null> {
    const result = await this.commandBus.execute(
      new UpdateRetreatCommand(uuid, data),
    );
    return result;
  }

  @Mutation(() => Boolean)
  async deleteRetreat(@Args("uuid") uuid: string): Promise<boolean> {
    const result = await this.commandBus.execute(
      new DeleteRetreatCommand({ uuid }),
    );
    return result;
  }
}
