import { Injectable } from '@nestjs/common';
import { Coupon, IssuedCoupon } from '../entities';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { IssuedCouponReqDto } from '../dto';
import { UserRepository } from 'src/auth/repositories';

@Injectable()
export class IssuedCouponRepository extends Repository<IssuedCoupon> {
  constructor(
    @InjectRepository(IssuedCoupon)
    private readonly repo: Repository<IssuedCoupon>,
    private readonly userRepository: UserRepository,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  // 사용했는지, 유효기간, 유효한지 사용한 날짜를 인자로 받아야겠네
  async saveIssuedCoupon(
    couponInfo: Coupon,
    issuedCouponReqDto: IssuedCouponReqDto,
    userId: string,
  ): Promise<IssuedCoupon> {
    const issuedCoupon = new IssuedCoupon();
    issuedCoupon.isValid = issuedCouponReqDto.isValid;
    issuedCoupon.validFrom = issuedCouponReqDto.validFrom;
    issuedCoupon.validUntil = issuedCouponReqDto.validUntil;
    issuedCoupon.isUsed = issuedCouponReqDto.isUsed;
    issuedCoupon.usedAt = issuedCouponReqDto.useAt;
    issuedCoupon.coupon = couponInfo;
    // 사용자 조회
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error(`사용자를 찾을 수 없습니다.`);
    }
    issuedCoupon.user = user;
    return this.repo.save(issuedCoupon);
  }

  use(issuedCoupon: IssuedCoupon): Promise<IssuedCoupon> {
    issuedCoupon.use();
    return this.save(issuedCoupon);
  }
}
