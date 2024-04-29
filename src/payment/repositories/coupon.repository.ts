import { Injectable } from '@nestjs/common';
import { Coupon } from '../entities';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CouponReqDto } from '../dto';

@Injectable()
export class CouponRepository extends Repository<Coupon> {
  constructor(
    @InjectRepository(Coupon)
    private readonly repo: Repository<Coupon>,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  async createCoupon(couponReqDto: CouponReqDto): Promise<Coupon> {
    const coupon = new Coupon();
    coupon.name = couponReqDto.name;
    coupon.type = couponReqDto.type;
    coupon.description = couponReqDto.description;
    coupon.value = couponReqDto.value;
    return this.repo.save(coupon);
  }
}
