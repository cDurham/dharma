import { Column, Entity, Index, ManyToOne } from "typeorm";
import { BaseEntity } from "../BaseEntity/base.entity";
import { User } from "../User/user.entity";

@Entity()
export class RefreshToken extends BaseEntity {
  @Column({ type: "varchar", length: 64 })
  @Index({ unique: true })
  tokenHash!: string;

  @ManyToOne(() => User, (user) => user.refreshTokens, {
    onDelete: "CASCADE",
  })
  user!: User;

  @Column()
  expiresAt!: Date;

  @Column()
  isRevoked!: boolean;

  @Column()
  hashedToken!: string;
}
