import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon, IssuedCoupon, Point, PointLog, Product } from './entities';
import {
  CouponRepository,
  IssuedCouponRepository,
  PointLogRepository,
  PointRepository,
} from './repositories';
import { CouponService } from './services/coupon.service';
import { CouponController } from './controllers/coupon.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Coupon, IssuedCoupon, Point, PointLog, Product]),
  ],
  controllers: [CouponController],
  providers: [
    CouponService,
    CouponRepository,
    IssuedCouponRepository,
    PointRepository,
    PointLogRepository,
  ],
  exports: [
    CouponService,
    CouponRepository,
    IssuedCouponRepository,
    PointRepository,
    PointLogRepository,
  ],
})
export class PaymentModule {}
