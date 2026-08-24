import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CreateRetreatInput, UpdateRetreatInput } from "./retreat.input.js";
import { toPublicRetreat } from "./retreat.projection.js";
import { RetreatService } from "./retreat.service.js";
import { Retreat } from "./retreat.type.js";

@Resolver(() => Retreat)
export class RetreatResolver {
  constructor(private readonly retreatService: RetreatService) {}

  @Query(() => Retreat)
  async retreat(@Args("uuid") uuid: string): Promise<Retreat | null> {
    const row = await this.retreatService.get(uuid);
    return row ? toPublicRetreat(row) : null;
  }

  @Query(() => [Retreat])
  async retreats(): Promise<Retreat[]> {
    const rows = await this.retreatService.list();
    return rows.map(toPublicRetreat);
  }

  @Mutation(() => Retreat)
  async createRetreat(
    @Args("data") data: CreateRetreatInput,
  ): Promise<Retreat> {
    return toPublicRetreat(await this.retreatService.create(data));
  }

  @Mutation(() => Retreat)
  async updateRetreat(
    @Args("uuid") uuid: string,
    @Args("data") data: UpdateRetreatInput,
  ): Promise<Retreat | null> {
    return toPublicRetreat(await this.retreatService.update(uuid, data));
  }

  @Mutation(() => Boolean)
  async deleteRetreat(@Args("uuid") uuid: string): Promise<boolean> {
    return this.retreatService.remove(uuid);
  }
}
