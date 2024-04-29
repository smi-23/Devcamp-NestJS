import { CouponType } from '../entities';

export type CouponReqDto = {
  name: string;
  type: CouponType;
  description: string;
  value: number;
};
