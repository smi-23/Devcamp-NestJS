import { BaseEntity } from '../../common/entities';
import { Column, Entity, OneToMany, Relation } from 'typeorm';
import { AccessToken } from './access-token.entity';
import { RefreshToken } from './refresh-token.entity';
import { AccessLog } from './access-log.entity';
import { IssuedCoupon } from 'src/payment/entities';

export type UserRole = 'admin' | 'user';

@Entity()
export class User extends BaseEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', length: 50 })
  phone: string;

  @Column({ type: 'varchar', length: 50 })
  role: UserRole;

  // @Column({ nullable: true })
  // regNo: string;

  // @Column({ default: false })
  // isPersonalInfoVerified: boolean;

  @OneToMany(() => AccessToken, (token) => token.user) // 이 경우는 양방향을 의미함
  accessToken: Relation<AccessToken[]>;

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshToken: Relation<RefreshToken[]>;

  @OneToMany(() => AccessLog, (log) => log.user)
  accessLogs: Relation<AccessLog[]>;

  @OneToMany(() => IssuedCoupon, (issuedCoupon) => issuedCoupon.user)
  issuedCoupons: Relation<IssuedCoupon[]>;
}
