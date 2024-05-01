import { ProductStatus } from '../entities';

export class CreateProductReqDto {
  name: string;
  price: number;
  stock: number;
  category?: string;
  imageUrl?: string;
  description?: string;
  status: ProductStatus;
}
