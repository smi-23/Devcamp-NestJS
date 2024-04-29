import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon } from './entities';
import { CouponRepository } from './repositories';
import { CouponService } from './services/coupon.service';
// import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Coupon])],
  controllers: [],
  providers: [CouponService, CouponRepository],
  exports: [],
})
export class PaymentModule {}
