import { Injectable, Logger } from '@nestjs/common';
import { CouponRepository } from '../repositories';
import { CouponReqDto } from '../dto';
// import { Coupon } from '../entities';

@Injectable()
export class CouponService {
  private readonly logger = new Logger(CouponService.name);
  constructor(private readonly couponRepository: CouponRepository) {}

  // async createCoupon(couponReqDto: CouponReqDto): Promise<Coupon> {
  //   return this.couponRepository.createCoupon(couponReqDto);
  // }

  async createCoupon(
    couponReqDto: CouponReqDto,
  ): Promise<{ message: string; content: CouponReqDto }> {
    const couponInfo = await this.couponRepository.createCoupon(couponReqDto);
    this.logger.log(`${couponInfo.name}쿠폰이 발급되었습니다.`);
    return {
      message: `${couponInfo.name}쿠폰이 생성되었습니다.`,
      content: {
        name: couponInfo.name,
        type: couponInfo.type,
        description: couponInfo.description,
        value: couponInfo.value,
      },
    };
  }

  // for test
  testHello(): string {
    return 'test Hello';
  }
}
