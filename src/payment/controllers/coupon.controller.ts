import { Body, Controller, Post } from '@nestjs/common';
import { CouponService } from '../services';

@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) { }
  @Post('create')
  async createCoupon(@Body() )
}
