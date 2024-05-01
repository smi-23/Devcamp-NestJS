import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { PaymentService } from '../services';
import {
  CreateOrderReqDto,
  CreateOrderResDto,
  CreateProductReqDto,
  TossPaymentDto,
} from '../dto';
import { Point, Product } from '../entities';

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Post('order')
  async createOrder(
    // @Req() req,
    @Body() body: CreateOrderReqDto,
  ): Promise<CreateOrderResDto> {
    // const { userId } = req.user;
    const order = await this.paymentService.initOrder(body);
    this.logger.log(`createOrder의 로그입니다. ${order}`);
    this.logger.log(`createOrder의 로그 두번째 입니다.: ${JSON.stringify(order)}`);

    return {
      orderItems: order.items,
      couponId: order.usedIssuedCoupon.coupon.id,
      issuedCouponId: order.usedIssuedCoupon.id,
      pointAmountToUse: order.pointAmountUsed,
      shippingAddress: order.shippingInfo.address,
      totalAmount: order.amount,
    };
  }

  @Get('success')
  async completeOrder(
    @Query() tossPaymentDto: TossPaymentDto,
  ): Promise<TossPaymentDto> {
    const responseTossDto =
      await this.paymentService.tossPayment(tossPaymentDto);
    return responseTossDto;
  }

  @Post('fail')
  failOrder() {
    return { response: '실패' };
  }

  @Post('product')
  async createProduct(@Body() body: CreateProductReqDto): Promise<Product> {
    return await this.paymentService.createProduct(body);
  }

  @Post('point')
  async createPoint(
    @Body() body: { userId: string; availableAmount: number },
  ): Promise<Point> {
    const { userId, availableAmount } = body;
    return await this.paymentService.createPoint(userId, availableAmount);
  }
}

// { "orderNo": "635a9f15-af75-4111-9ba7-a0545e16bfda", 
// "user": { 
// "id": "3d18afc5-13af-42f8-8e5d-e2115c6c8fd8", 
// "createdAt": "2024-05-01T15:17:56.342Z", 
// "updatedAt": "2024-05-01T15:17:56.342Z", 
// "name": "유저", 
// "email": "user1", 
// "password": "$argon2id$v=19$m=65536,t=3,p=4$fVognZw8uXXeUc60Ngimhw$6/iO3L6M9d9XuF89s3tVQ5EVl/1W7iv0L3rY6SRpBDM", 
// "phone": "01012341234", 
// "role": "user" }, 
// "amount": 0, 
// "status": "started", 
// "items": [{ "productId": "eabc2735-e055-4c6f-93be-d76c7ee20a2a", "quantity": 2 }], 
// "shippingInfo": 
// { 
// "address": "TestShippingAddress", 
// "status": "ordered", 
// "trackingNumber": null, 
// "shippingCompany": null, 
// "id": "e7aa2d27-bec1-4fe5-8676-11985ddc6147", 
// "createdAt": "2024-05-01T17:51:15.436Z", 
// "updatedAt": "2024-05-01T17:51:15.436Z" }, 
// "refundReason": null, 
// "refundedAmount": null, 
// "refundedAt": null, 
// "pgMetadata": null, 
// "id": "99792f27-d799-4ea5-9d4a-c7d54160e166", 
// "createdAt": "2024-05-01T17:51:15.418Z", 
// "updatedAt": "2024-05-01T17:51:15.418Z", 
// "pointAmountUsed": 0 }