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
import { UserRepository } from 'src/auth/repositories';
import { User } from 'src/auth/entities';

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
      User,
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
    UserRepository,
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
    UserRepository,
  ],
})
export class PaymentModule {}
