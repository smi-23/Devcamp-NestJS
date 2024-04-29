import { BaseEntity } from "src/common/entities";
import { Entity } from "typeorm";

type CouponType = 'precent' | 'fixed';

@Entity()
export class Coupon extends BaseEntity {
  @Column
}