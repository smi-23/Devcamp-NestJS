import { User } from 'src/auth/entities';
import { BaseEntity } from 'src/common/entities';
import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  Relation,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { IssuedCoupon } from './issued-coupon.entity';
import { OrderItem } from './order-item.entity';
import { ShippingInfo } from './shipping-info.entity';

export type OrderStatus = 'started' | 'paid' | 'refunded';

@Entity()
export class Order extends BaseEntity {
  @Column({ type: 'varchar' })
  orderNo: string;

  @Column()
  amount: number;

  @Column({ type: 'varchar', length: 100 })
  status: OrderStatus;

  @Column({ type: 'int', default: 0 })
  pointAmountUsed: number;

  @Column({ type: 'text', nullable: true })
  refundReason: string;

  @Column({ type: 'decimal', nullable: true })
  refundedAmount: number;

  @Column({ type: 'timestamp', nullable: true })
  refundedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  pgMetadata: any;

  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: Relation<OrderItem[]>;

  @OneToOne(() => IssuedCoupon, (issuedCoupon) => issuedCoupon.usedOrder, {
    nullable: true,
  })
  @JoinColumn()
  usedIssuedCoupon: Relation<IssuedCoupon>;

  @OneToOne(() => ShippingInfo, (shippingInfo) => shippingInfo.order, {
    nullable: true,
  })
  @JoinColumn()
  shippingInfo: Relation<ShippingInfo>;
}
