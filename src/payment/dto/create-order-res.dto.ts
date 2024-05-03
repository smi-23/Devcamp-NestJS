import { OrderItem } from '../entities';

export type CreateOrderResDto = {
  orderItems: OrderItem[];
  couponId?: string;
  issuedCouponId?: string;
  pointAmountToUse?: number;
  shippingAddress?: string;
  totalAmount: number;
};
