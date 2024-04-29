import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon, IssuedCoupon } from './entities';
import { CouponRepository } from './repositories';
import { CouponService } from './services/coupon.service';
// import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Coupon, IssuedCoupon])],
  controllers: [],
  providers: [CouponService, CouponRepository],
  exports: [],
})
export class PaymentModule {}
