import { Body, Controller, Post, Get } from '@nestjs/common';
import { CouponService } from '../services';
import { CouponReqDto } from '../dto';

@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post('create')
  async createCoupon(
    @Body() couponReqDto: CouponReqDto,
  ): Promise<CouponReqDto> {
    return await this.couponService.createCoupon(couponReqDto);
  }

  // for tset
  @Get()
  testHello(): string {
    return this.couponService.testHello();
  }
}
