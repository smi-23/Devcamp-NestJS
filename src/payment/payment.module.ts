import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon, IssuedCoupon, Point, PointLog } from './entities';
import { CouponRepository, IssuedCouponRepository } from './repositories';
import { CouponService } from './services/coupon.service';
import { CouponController } from './controllers/coupon.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Coupon, IssuedCoupon, Point, PointLog])],
  controllers: [CouponController],
  providers: [CouponService, CouponRepository, IssuedCouponRepository],
  exports: [CouponService, CouponRepository, IssuedCouponRepository],
})
export class PaymentModule {}
