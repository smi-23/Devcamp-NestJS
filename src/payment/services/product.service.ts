import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../repositories';
import { Product } from '../entities';

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async getProductByIds(productIds: string[]): Promise<Product[]> {
    return await this.productRepository.getProductByIds(productIds);
  }
}
