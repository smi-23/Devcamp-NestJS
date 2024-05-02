import { Injectable, Logger } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Order, OrderItem, ShippingInfo } from '../entities';
import { UserRepository } from 'src/auth/repositories';
import { IssuedCouponRepository } from './issued-coupon.repository';
import { PointRepository } from './point.repository';
import { JsonWebTokenError } from '@nestjs/jwt';

@Injectable()
export class OrderRepository extends Repository<Order> {
  private readonly logger = new Logger(OrderRepository.name);

  constructor(
    @InjectRepository(Order)
    private readonly repo: Repository<Order>,
    // private readonly userRepository: UserRepository,
    // private readonly issuedCouponRepository: IssuedCouponRepository,
    // private readonly pointRepository: PointRepository,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly userRepository: UserRepository,
    private readonly pointRepository: PointRepository,
    private readonly issuedCouponRepository: IssuedCouponRepository,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  async createOrder(
    userId: string,
    orderItems: OrderItem[],
    finalAmount: number,
    shippingInfo?: ShippingInfo,
    issuedCouponId?: string,
    pointAmountToUse?: number,
  ): Promise<Order> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    // const usedIssuedCoupon = await this.issuedCouponRepository.findOne({ where: { id: issuedCouponId } });
    const usedIssuedCoupon = await this.issuedCouponRepository.findOne({
      where: { id: issuedCouponId },
      relations: ['coupon', 'user'],
    });
    const order = new Order();
    order.user = user;
    order.amount = finalAmount;
    order.status = 'started';
    order.items = orderItems;
    order.shippingInfo = shippingInfo;
    order.usedIssuedCoupon = usedIssuedCoupon;
    order.pointAmountUsed = pointAmountToUse;
    return this.save(order);
  }

  async completeOrder(orderId: string): Promise<Order> {
    const order = await this.findOne({
      where: { orderNo: orderId },
      relations: ['usedIssuedCoupon', 'user'],
    });
    order.status = 'paid';

    await Promise.all([
      this.issuedCouponRepository.use(order.usedIssuedCoupon),
      this.pointRepository.use(
        order.user.id,
        order.pointAmountUsed,
        '주문 사용',
      ),
    ]);
    return this.save(order);
  }
}
