import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CouponService } from './coupon.service';
import {
  CouponRepository,
  IssuedCouponRepository,
  OrderRepository,
  PointLogRepository,
  PointRepository,
  ProductRepository,
  ShippingInfoRepository,
} from '../repositories';
import { BusinessException } from 'src/exception';
import { Order, OrderItem, Point, Product } from '../entities';
import { ProductService } from './product.service';
import { Transactional } from 'typeorm-transactional';
import { CreateOrderReqDto, CreateProductReqDto, TossPaymentDto } from '../dto';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid_v4 } from 'uuid';
import axios from 'axios';
import { UserRepository } from 'src/auth/repositories';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly tossUrl = 'https://api.tosspayments.com/v1/payments';
  private readonly tossSecretKey =
    this.configService.get<string>('TOSS_SECRET');

  constructor(
    private readonly couponRepository: CouponRepository,
    private readonly issuedCouponRepository: IssuedCouponRepository,
    private readonly pointRepository: PointRepository,
    private readonly pointLogRepository: PointLogRepository,
    private readonly productService: ProductService,
    private readonly orderRepository: OrderRepository,
    private readonly shippingInfoRepository: ShippingInfoRepository,
    private readonly configService: ConfigService,
    private readonly productRepository: ProductRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async tossPayment(tossDto: TossPaymentDto): Promise<TossPaymentDto> {
    try {
      const idempotency = uuid_v4();

      const { paymentKey, orderId, amount } = tossDto;

      const response = await axios.post(
        `${this.tossUrl}/${paymentKey}`,
        {
          orderId,
          amount,
        },
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${this.tossSecretKey}:`).toString('base64')}`,
            'Content-Type': 'application/json',
            'Idempotency-Key': `${idempotency}`,
          },
        },
      );

      const findOrder = await this.orderRepository.findOneBy({
        orderNo: orderId,
      });

      if (!findOrder) {
        throw new BusinessException(
          'payment',
          'Not-found-order',
          'Not-found-order',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!response) {
        throw new BusinessException(
          'payment',
          'Toss-payments-error',
          'Toss-payments-error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      if (response.data.orderId !== findOrder.orderNo) {
        throw new BusinessException(
          'payment',
          'Order-Miss-Match',
          'Order-Miss-Match',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (response.data.amount !== findOrder.amount) {
        throw new BusinessException(
          'payment',
          'Amount-Miss-Match',
          'Amount-Miss-Match',
          HttpStatus.BAD_GATEWAY,
        );
      }

      const order = await this.completeOrder(orderId);

      return {
        paymentKey: paymentKey,
        orderId: order.orderNo,
        amount: order.amount,
      };
    } catch (error) {
      console.error(error.response ? error.response.data : error.message);
    }
  }

  // 주문 생성
  @Transactional()
  async initOrder(dto: CreateOrderReqDto): Promise<Order> {
    // 주문 금액 계산
    const totalAmount = await this.calculateTotalAmount(dto.orderItems);

    // 할인 적용
    const finalAmount = await this.applyDiscounts(
      totalAmount,
      dto.userId,
      dto.couponId,
      dto.pointAmountToUse,
    );

    // 주문 생성
    return this.createOrder(
      dto.userId,
      dto.orderItems,
      finalAmount,
      dto.shippingAddress,
    );
  }

  // 주문 완료
  @Transactional()
  async completeOrder(orderId: string): Promise<Order> {
    return this.orderRepository.completeOrder(orderId);
  }

  private async createOrder(
    userId: string,
    orderItems: OrderItem[],
    finalAmount: number,
    shippingAddress?: string,
  ): Promise<Order> {
    const shippingInfo = shippingAddress
      ? await this.shippingInfoRepository.createShippingInfo(shippingAddress)
      : null;
    return await this.orderRepository.createOrder(
      userId,
      orderItems,
      finalAmount,
      shippingInfo,
    );
  }

  async createProduct(dto: CreateProductReqDto): Promise<Product> {
    return await this.productRepository.createProduct(dto);
  }

  async createPoint(userId: string, availableAmount: number): Promise<Point> {
    return await this.pointRepository.createPoint(userId, availableAmount);
  }

  private async calculateTotalAmount(orderItmes: OrderItem[]): Promise<number> {
    let totalAmount = 0;
    const productIds = orderItmes.map((item) => item.productId);
    const products = await this.productService.getProductByIds(productIds);
    for (const item of orderItmes) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new BusinessException(
          'payment',
          `Product with ID ${item.productId} not found`,
          'Invalid product',
          HttpStatus.BAD_REQUEST,
        );
      }
      totalAmount += product.price * item.quantity;
    }
    return totalAmount;
  }

  // 최종적으로 할인이 얼마가 적용되는지
  private async applyDiscounts(
    totalAmount: number,
    userId: string,
    couponId: string,
    pointAmountToUse?: number,
  ): Promise<number> {
    this.logger.log(`인자로 받은 쿠폰아이디입니다. ${couponId}`);

    const couponDiscount = couponId
      ? await this.applyCoupon(couponId, userId, totalAmount)
      : 0;
    const pointDiscount = pointAmountToUse
      ? await this.applyPoints(pointAmountToUse, userId)
      : 0;
    this.logger.log(`함수 실행 후 쿠폰아이디입니다. ${couponId} 함수 실행 후 쿠폰디스카운트 ${couponDiscount}`);

    // 사실상 적립금을 후처리, 적립금을 먼저 처리하고 쿠폰을 사용하면 어떻게 될까?( 사용자가 받는 할인 감소)
    const finalAmount = totalAmount - (couponDiscount + pointDiscount);
    return finalAmount < 0 ? 0 : finalAmount;
  }

  // 포인트가 먼저 적용되어 totalAmount가 감소한 상태에서 쿠폰을 적용하는 메소드
  private async applyDiscountsAfterPoints(
    totalAmount: number,
    userId: string,
    couponId: string,
    pointAmountToUse?: number,
  ): Promise<number> {
    const pointDiscount = pointAmountToUse
      ? await this.applyPoints(pointAmountToUse, userId)
      : 0;
    const totalAmountAfterPoints = totalAmount - pointDiscount;
    const couponDiscount = couponId
      ? await this.applyCoupon(couponId, userId, totalAmountAfterPoints)
      : 0;

    const finalAmount = totalAmount - couponDiscount;
    return finalAmount < 0 ? 0 : finalAmount;
  }

  // 쿠폰이 얼마나 적용되는지 계산 => 할인된 금액을 반환하는 것
  private async applyCoupon(
    couponId: string,
    userId: string,
    totalAmount: number,
  ): Promise<number> {
    const issuedCoupon = await this.issuedCouponRepository.findOne({
      where: { coupon: { id: couponId }, user: { id: userId } },
      relations: ['coupon'], // 관련된 쿠폰 엔터티를 가져오도록 설정
    });

    if (!issuedCoupon) {
      throw new BusinessException(
        'payment',
        `user doesn't have coupon. couponId: ${couponId} userId: ${userId}`,
        'Invalid coupon',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 옵셔널 체이닝을 사용하여 안전하게 접근
    const couponType = issuedCoupon?.coupon?.type;

    if (!couponType) {
      throw new BusinessException(
        'payment',
        `Invalid coupon type. couponId: ${couponId} userId: ${userId}`,
        'Invalid coupon',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (couponType === 'percent') {
      return (totalAmount * issuedCoupon.coupon.value) / 100;
    } else if (couponType === 'fixed') {
      return issuedCoupon.coupon.value;
    }
    return 0; // 쿠폰의 타입이 percent, fixed가 아닐 경우
  }

  // 해당 유저가 이 포인트를 사용 가능한지 체크하고 그 값을 반환
  private async applyPoints(
    pointAmountToUse: number,
    userId: string,
  ): Promise<number> {
    const point = await this.pointRepository.findOne({
      where: { user: { id: userId } },
    });
    if (point.availableAmount < 0 || point.availableAmount < pointAmountToUse) {
      // userId를 통해 조회한 포인트가 충분하지 않다면 에러
      throw new BusinessException(
        'payment',
        `Invalid points amount ${point.availableAmount}`,
        'Invalid points',
        HttpStatus.BAD_REQUEST,
      );
    }
    return pointAmountToUse;
  }
}
