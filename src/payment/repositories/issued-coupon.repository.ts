import { Injectable } from '@nestjs/common';
import { IssuedCoupon } from '../entities';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class IssuedCouponRepository extends Repository<IssuedCoupon> {
  constructor(
    @InjectRepository(IssuedCoupon)
    private readonly repo: Repository<IssuedCoupon>,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  use(issuedCoupon: IssuedCoupon): Promise<IssuedCoupon> {
    issuedCoupon.use();
    return this.save(issuedCoupon);
  }
}
