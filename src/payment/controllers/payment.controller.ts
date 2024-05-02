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
    const order = await this.paymentService.initOrder(body);
    this.logger.log(
      `order객체의 포인트 사용량 입니다.: ${JSON.stringify(order.pointAmountUsed)}`,
      `order객체의 의 로그 세번째 입니다.: ${JSON.stringify(order.usedIssuedCoupon.coupon.id)}`,
    );

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
