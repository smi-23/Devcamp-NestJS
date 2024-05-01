import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CouponService } from './coupon.service';
import {
  CouponRepository,
  IssuedCouponRepository,
  OrderRepository,
  PointLogRepository,
  PointRepository,
  ShippingInfoRepository,
} from '../repositories';
import { BusinessException } from 'src/exception';
import { Order, OrderItem, Product } from '../entities';
import { ProductService } from './product.service';
import { Transactional } from 'typeorm-transactional';
import { CreateOrderDto } from '../dto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(CouponService.name);

  constructor(
    private readonly couponRepository: CouponRepository,
    private readonly issuedCouponRepository: IssuedCouponRepository,
    private readonly pointRepository: PointRepository,
    private readonly pointLogRepository: PointLogRepository,
    private readonly productService: ProductService,
    private readonly orderRepository: OrderRepository,
    private readonly shippingInfoRepository: ShippingInfoRepository,
  ) {}

  // 주문 생성
  @Transactional()
  async initOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const totalAmount = await this.calculateTotalAmount(
      createOrderDto.orderItems,
    );
    const finalAmount = await this.applyDiscounts(
      totalAmount,
      createOrderDto.userId,
      createOrderDto.couponId,
      createOrderDto.pointAmountToUse,
    );
    return this.createOrder(
      createOrderDto.userId,
      createOrderDto.orderItems,
      finalAmount,
      createOrderDto.shippingAddress,
    );
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

  // 주문 완료
  @Transactional()
  async completeOrder(orderId: string): Promise<Order> {
    return this.orderRepository.completeOrder(orderId);
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
    const couponDiscount = couponId
      ? await this.applyCoupon(couponId, userId, totalAmount)
      : 0;
    const pointDiscount = pointAmountToUse
      ? await this.applyPoints(pointAmountToUse, userId)
      : 0;

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
      // await을 하지 않으면 issuedCoupon에 실제 쿠폰 객체가 할당되어 옵셔널 체이닝을 사용하여 속성에 접근이 가능
      where: { coupon: { id: couponId }, user: { id: userId } },
    });

    if (!issuedCoupon) {
      throw new BusinessException(
        'payment',
        `user doesn't have coupon. couponId: ${couponId} userId: ${userId}`,
        'Invalid coupon',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 옵셔널 체이닝, 논리 연산자
    const isValid =
      issuedCoupon?.isValid &&
      issuedCoupon?.validFrom <= new Date() &&
      issuedCoupon?.validUntil > new Date();
    if (!isValid) {
      throw new BusinessException(
        'payment',
        `Invalid coupon type. couponId: ${couponId} userId: ${userId}`,
        'Invalid coupon',
        HttpStatus.BAD_REQUEST,
      );
    }

    const { coupon } = issuedCoupon;
    if (coupon.type === 'percent') {
      return (totalAmount * coupon.value) / 100;
    } else if (coupon.type === 'fixed') {
      return coupon.value;
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
