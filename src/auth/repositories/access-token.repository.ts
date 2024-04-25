import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AccessToken } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AccessTokenRepository extends Repository<AccessToken> {
  constructor(
    @InjectRepository(AccessToken)
    private readonly repo: Repository<AccessToken>,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }
}
