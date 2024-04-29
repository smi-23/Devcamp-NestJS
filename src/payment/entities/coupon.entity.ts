import { BaseEntity } from '../../common/entities';
import { Column, Entity } from 'typeorm';

type CouponType = 'precent' | 'fixed';

@Entity()
export class Coupon extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  type: CouponType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  value: number; // 할인율 또는 정액금액
}
