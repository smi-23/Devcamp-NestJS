import { Injectable } from '@nestjs/common';
import { Coupon } from '../entities';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CouponRepository extends Repository<Coupon> {
  constructor(
    @InjectRepository(Coupon)
    private readonly repo: Repository<Coupon>,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }
}
