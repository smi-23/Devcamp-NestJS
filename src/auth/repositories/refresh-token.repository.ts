import { Injectable } from '@nestjs/common';
import { RefreshToken } from '../entities';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RefreshTokenRepository extends Repository<RefreshToken> {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly repo: Repository<RefreshToken>,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }
}
