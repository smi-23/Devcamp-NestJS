import { OrderItem } from '../entities';

export type CreateOrderReqDto = {
  userId: string;
  orderItems: OrderItem[];
  couponId?: string;
  pointAmountToUse?: number;
  shippingAddress?: string;
};
