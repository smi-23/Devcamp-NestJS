import { User } from 'src/auth/entities';
import { BaseEntity } from 'src/common/entities';
import {
  Entity,
  Column,
  JoinColumn,
  OneToMany,
  OneToOne,
  Relation,
} from 'typeorm';
import { PointLog } from './point-log.entity';

@Entity()
export class Point extends BaseEntity {
  @OneToOne(() => User, (user) => user.point)
  @JoinColumn()
  user: Relation<User>;

  @Column({ type: 'int' })
  availableAmount: number;

  @OneToMany(() => PointLog, (pointLog) => pointLog.amount)
  logs: Relation<PointLog[]>;

  use(amountToUse: number) {
    this.availableAmount -= amountToUse;
  }
}
