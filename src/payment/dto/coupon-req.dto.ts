import { CouponType } from '../entities';

export type CouponReqDto = {
  id: string;
  name: string;
  type: CouponType;
  description: string;
  value: number;
};
