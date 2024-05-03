import { OrderItem } from '../entities';

export type CreateOrderReqDto = {
  userId: string;
  orderItems: OrderItem[];
  couponId?: string;
  issuedCouponId?: string;
  pointAmountToUse?: number;
  shippingAddress?: string;
};
