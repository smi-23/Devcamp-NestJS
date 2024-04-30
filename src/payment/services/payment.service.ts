import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CouponService } from './coupon.service';
import {
  CouponRepository,
  IssuedCouponRepository,
  PointLogRepository,
  PointRepository,
} from '../repositories';
import { BusinessException } from 'src/exception';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(CouponService.name);

  constructor(
    private readonly couponRepository: CouponRepository,
    private readonly issuedCouponRepository: IssuedCouponRepository,
    private readonly pointRepository: PointRepository,
    private readonly pointLogRepository: PointLogRepository,
  ) {}

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
