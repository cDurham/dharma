import type { Retreat } from "./retreat.entity";

export class CreateRetreatInput implements Partial<Retreat> {
  name!: string;
  startAt!: Date;
  endAt!: Date;
}

export class UpdateRetreatInput implements Partial<Retreat> {
  name?: string;
  startAt?: Date;
  endAt?: Date;
}

export class DeleteRetreatInput {
  uuid!: string;
}
