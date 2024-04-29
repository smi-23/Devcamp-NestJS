import { Body, Controller, Post, Get } from '@nestjs/common';
import { CouponService } from '../services';
import { CouponReqDto } from '../dto';

@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  // @Post('create')
  // async createCoupon(
  //   @Body() couponReqDto: CouponReqDto,
  // ): Promise<{ message: string; content: CouponReqDto }> {
  //   const couponInfo = await this.couponService.createCoupon(couponReqDto);
  //   return {
  //     message: '쿠폰이 생성되었습니다.',
  //     content: {
  //       name: couponInfo.name,
  //       type: couponInfo.type,
  //       description: couponInfo.description,
  //       value: couponInfo.value,
  //     },
  //   };
  // }

  @Post('create')
  async createCoupon(
    @Body() couponReqDto: CouponReqDto,
  ): Promise<{ message: string; content: CouponReqDto }> {
    return await this.couponService.createCoupon(couponReqDto);
  }

  // for tset
  @Get()
  testHello(): string {
    return this.couponService.testHello();
  }
}
