import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderItem } from '../entities';

@Injectable()
export class OrderItemRepository extends Repository<OrderItem> {
  constructor(
    @InjectRepository(OrderItem)
    private readonly repo: Repository<OrderItem>,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }
}
