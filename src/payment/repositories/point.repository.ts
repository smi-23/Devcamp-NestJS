import { Injectable } from '@nestjs/common';
import { Point } from '../entities';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PointLogRepository } from './point-log.repository';
import { UserRepository } from 'src/auth/repositories';

@Injectable()
export class PointRepository extends Repository<Point> {
  constructor(
    @InjectRepository(Point)
    private readonly repo: Repository<Point>,
    private readonly pointLogRepository: PointLogRepository,
    private readonly userRepository: UserRepository,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  async createPoint(userId: string, availableAmount: number): Promise<Point> {
    const point = new Point();
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error(`사용자를 찾을 수 없습니다.`);
    }
    point.user = user;
    point.availableAmount = availableAmount;
    return this.save(point);
  }

  async use(userId, amountToUse: number, reason: string): Promise<Point> {
    const point = await this.findOne({ where: { user: { id: userId } } });
    point.use(amountToUse);
    await this.pointLogRepository.use(point, amountToUse, reason);
    return this.save(point);
  }
}
