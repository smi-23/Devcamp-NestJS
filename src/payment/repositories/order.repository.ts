import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository, } from '@nestjs/typeorm';
import { Order } from '../entities';

@Injectable()
export class OrderRepository extends Repository<Order> {
  constructor(
    @InjectRepository(Order)
    private readonly repo: Repository<Order>,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }
}
