import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccessLog, User } from '../entities';
import { Repository } from 'typeorm';

@Injectable()
export class AccessLogRepository extends Repository<AccessLog> {
  constructor(
    @InjectRepository(AccessLog)
    private readonly repo: Repository<AccessLog>,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  async createAccessLog(user: User, ua: string, endpoint: string, ip: string) {
    const accessLog = new AccessLog();
    accessLog.user = user;
    accessLog.ua = ua;
    accessLog.endpoint = endpoint;
    accessLog.ip = ip;
    accessLog.accessedAt = new Date(Date.now());
    await this.save(accessLog);
  }
}
