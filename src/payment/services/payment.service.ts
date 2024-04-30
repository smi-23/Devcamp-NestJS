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

  // 해당 유저가 이 포인트를 사용 가능한지 체크
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
