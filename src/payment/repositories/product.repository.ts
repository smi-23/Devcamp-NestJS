import { Injectable } from '@nestjs/common';
import { Product } from '../entities';
import { Repository, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductReqDto } from '../dto';

@Injectable()
export class ProductRepository extends Repository<Product> {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  async getProductByIds(productIds: string[]): Promise<Product[]> {
    return await this.findBy({ id: In(productIds) }); // In은 주어진 배열에 포함된 값 중 하나와 일치하는 데이터를 찾을 때 사용될 수 있는 연산자
  }

  async createProduct(dto: CreateProductReqDto): Promise<Product> {
    const product = new Product();
    product.name = dto.name;
    product.price = dto.price;
    product.stock = dto.stock;
    product.category = dto.category;
    product.imageUrl = dto.imageUrl;
    product.description = dto.description;
    product.status = dto.status;

    return this.repo.save(product);
  }
}
