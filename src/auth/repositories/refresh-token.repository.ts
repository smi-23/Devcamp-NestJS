import { Injectable } from '@nestjs/common';
import { RefreshToken, User } from '../entities';
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

  async saveAccessToken(
    jti: string,
    user: User,
    token: string,
    expiresAT: Date,
  ): Promise<RefreshToken> {
    const refreshToken = new RefreshToken();
    refreshToken.jti = jti;
    refreshToken.user = user;
    refreshToken.token = token;
    refreshToken.expiresAt = expiresAT;
    refreshToken.isRevoked = false;
    return this.save(refreshToken);
  }
}
