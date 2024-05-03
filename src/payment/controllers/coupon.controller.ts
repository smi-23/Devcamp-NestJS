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

  // for tset
  @Get()
  testHello(): string {
    return this.couponService.testHello();
  }

  @Post('create')
  async createCoupon(
    @Body() couponReqDto: CouponReqDto,
  ): Promise<{ message: string; content: CouponReqDto }> {
    return await this.couponService.createCoupon(couponReqDto);
  }

  // 임시로 쿠폰 발급을 위한 쿠폰 id는 body로 전달
  @Post('issue')
  async issueCoupon(
    @Body() body: { id: string; userId: string }, // Json형태로 받기 위해서
  ): Promise<{ message: string; content: CouponReqDto }> {
    const { id, userId } = body;
    return await this.couponService.issueCoupon(id, userId);
  }
}
