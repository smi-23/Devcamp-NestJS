import { Injectable } from '@nestjs/common';
import { CouponRepository } from '../repositories';

@Injectable()
export class CouponService {
  constructor(private readonly couponRepository: CouponRepository) {}
}
