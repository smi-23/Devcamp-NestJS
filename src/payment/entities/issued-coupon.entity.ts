// import { User } from 'src/auth/entities';
import { BaseEntity } from '../../common/entities';
import { Column, Entity, ManyToOne, JoinColumn, Relation } from 'typeorm';
import { Coupon } from './coupon.entity';
import { User } from 'src/auth/entities';

@Entity()
export class IssuedCoupon extends BaseEntity {
  @ManyToOne(() => Coupon)
  @JoinColumn()
  coupon: Relation<Coupon>;

  @ManyToOne(() => User)
  @JoinColumn()
  user: Relation<User>;

  @Column({ type: 'boolean', default: false })
  isValid: boolean;

  @Column({ type: 'boolean', default: false })
  isUsed: boolean;

  @Column({ type: 'timestamp', nullable: false })
  validFrom: Date; // 언제부터 유효한지

  @Column({ type: 'timestamp', nullable: false })
  validUntil: Date; // 언제까지 유효한지

  @Column({ type: 'timestamp', nullable: true })
  usedAt: Date;

  use() {
    this.isUsed = true;
    this.isValid = false;
    this.usedAt = new Date();
  }
}
