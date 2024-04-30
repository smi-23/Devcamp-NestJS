import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon, IssuedCoupon, Point, PointLog, Product } from './entities';
import {
  CouponRepository,
  IssuedCouponRepository,
  PointLogRepository,
  PointRepository,
  ProductRepository,
} from './repositories';
import { CouponService } from './services/coupon.service';
import { CouponController } from './controllers/coupon.controller';
import { ProductService } from './services';

@Module({
  imports: [
    TypeOrmModule.forFeature([Coupon, IssuedCoupon, Point, PointLog, Product]),
  ],
  controllers: [CouponController],
  providers: [
    CouponService,
    ProductService,
    CouponRepository,
    IssuedCouponRepository,
    PointRepository,
    PointLogRepository,
    ProductRepository,
  ],
  exports: [
    CouponService,
    ProductService,
    CouponRepository,
    IssuedCouponRepository,
    PointRepository,
    PointLogRepository,
    ProductRepository,
  ],
})
export class PaymentModule {}
