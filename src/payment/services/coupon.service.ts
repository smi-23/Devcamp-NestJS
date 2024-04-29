import { Injectable, Logger } from '@nestjs/common';
import { CouponRepository, IssuedCouponRepository } from '../repositories';
import { CouponReqDto, IssuedCouponReqDto } from '../dto';

@Injectable()
export class CouponService {
  private readonly logger = new Logger(CouponService.name);
  constructor(
    private readonly couponRepository: CouponRepository,
    private readonly issuedCouponRepository: IssuedCouponRepository,
  ) {}

  // async createCoupon(couponReqDto: CouponReqDto): Promise<Coupon> {
  //   return this.couponRepository.createCoupon(couponReqDto);
  // }

  // for test
  testHello(): string {
    return 'test Hello';
  }

  async createCoupon(
    couponReqDto: CouponReqDto,
  ): Promise<{ message: string; content: CouponReqDto }> {
    const couponInfo = await this.couponRepository.createCoupon(couponReqDto);

    this.logger.log(`${couponInfo.name}쿠폰이 발급되었습니다.`);

    return {
      message: `${couponInfo.name}쿠폰이 생성되었습니다.`,
      content: {
        name: couponInfo.name,
        type: couponInfo.type,
        description: couponInfo.description,
        value: couponInfo.value,
      },
    };
  }

  async issueCoupon(
    id: string,
  ): Promise<{ message: string; content: CouponReqDto }> { // 지금 리퀘스트 디티오만 사용하고 있어서 수정해야 함
    const couponInfo = await this.couponRepository.findOneById(id);
    if (!couponInfo) {
      throw new Error(`쿠폰 정보를 찾을 수 없습니다.`);
    }

    // 쿠폰 발급일 설정
    const validFrom = new Date();
    // 쿠폰 유효기간 설정
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 7); // 예시로 7일간 유효하도록 설정

    const issuedCouponReqDto: IssuedCouponReqDto = {
      isValid: true,
      validFrom,
      validUntil,
      isUsed: false,
      useAt: null,
    };

    const issuedCouponInfo = this.issuedCouponRepository.saveIssuedCoupon(
      couponInfo,
      issuedCouponReqDto,
    );

    return {
      message: `${couponInfo.name}쿠폰이 발급되었습니다.`,
      content: {
        name: couponInfo.name,
        type: couponInfo.type,
        description: couponInfo.description,
        value: couponInfo.value,
        // isValid1: (await issuedCouponInfo).isValid,
        // validFrom: (await issuedCouponInfo).validFrom,
        // validUntil: (await issuedCouponInfo).validUntil,
        // isUsed: (await issuedCouponInfo).isUsed,
        // useAt: (await issuedCouponInfo).usedAt,
      },
    };
  }
}
