import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository, } from '@nestjs/typeorm';
import { Order, ShippingInfo } from '../entities';

@Injectable()
export class ShippingInfoRepository extends Repository<ShippingInfo> {
  constructor(
    @InjectRepository(ShippingInfo)
    private readonly repo: Repository<ShippingInfo>,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }
}
