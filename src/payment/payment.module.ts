import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Coupon,
  IssuedCoupon,
  Order,
  OrderItem,
  Point,
  PointLog,
  Product,
  ShippingInfo,
} from './entities';
import {
  CouponRepository,
  IssuedCouponRepository,
  OrderItemRepository,
  OrderRepository,
  PointLogRepository,
  PointRepository,
  ProductRepository,
  ShippingInfoRepository,
} from './repositories';
import { CouponService } from './services/coupon.service';
import { CouponController } from './controllers/coupon.controller';
import { ProductService } from './services';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Coupon,
      IssuedCoupon,
      Point,
      PointLog,
      Product,
      Order,
      OrderItem,
      ShippingInfo,
    ]),
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
    OrderItemRepository,
    OrderRepository,
    ShippingInfoRepository,
  ],
  exports: [
    CouponService,
    ProductService,
    CouponRepository,
    IssuedCouponRepository,
    PointRepository,
    PointLogRepository,
    ProductRepository,
    OrderItemRepository,
    OrderRepository,
    ShippingInfoRepository,
  ],
})
export class PaymentModule {}
