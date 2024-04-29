import { Injectable } from '@nestjs/common';
import { CouponRepository } from '../repositories';
import { CouponReqDto } from '../dto';
import { Coupon } from '../entities';

@Injectable()
export class CouponService {
  constructor(private readonly couponRepository: CouponRepository) {}

  async createCoupon(couponReqDto: CouponReqDto): Promise<Coupon> {
    return this.couponRepository.createCoupon(couponReqDto);
  }

  // for test
  testHello(): string {
    return 'test Hello';
  }
}
