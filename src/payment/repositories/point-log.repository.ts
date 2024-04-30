import { Injectable } from '@nestjs/common';
import { Point, PointLog } from '../entities';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PointLogRepository extends Repository<PointLog> {
  constructor(
    @InjectRepository(PointLog)
    private readonly repo: Repository<PointLog>,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  use(point: Point, amountToUse: number, reason: string): Promise<PointLog> {
    const pointLog = new PointLog();
    pointLog.point = point;
    pointLog.use(amountToUse, reason);
    return this.save(pointLog);
  }
}

// use(amountToUse: number) {
//   this.availableAmount -= amountToUse;
// }
