import { Injectable } from '@nestjs/common';
import { Product } from '../entities';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PointRepository extends Repository<Product> {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }
}