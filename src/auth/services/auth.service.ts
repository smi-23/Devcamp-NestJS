import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  AccessTokenRepository,
  RefreshTokenRepository,
  UserRepository,
} from '../repositories';
import { User } from '../entities';
import * as argon2 from 'argon2';
import { BusinessException } from 'src/exception';
import { LoginResDto } from '../dto/login-res.dto';
import { TokenPayload } from '../dto';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly accessTokenRepository: AccessTokenRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly configService: ConfigService,
  ) {}

  async login(
    email: string,
    plainPassword: string,
  ): Promise<{ message: string; content: LoginResDto }> {
    const user = await this.validateUser(email, plainPassword);
    const paylaod: TokenPayload = this.createTokenPayload(user.id); // 함수의 매개변수에는 타입정보를 입력하지 않습니다.

    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken(user, paylaod),
      this.createRefreshToken(user, paylaod),
    ]);

    this.logger.log(`사용자 ${email}(${user.id})가 로그인 했습니다.`);

    return {
      message: '로그인에 성공하셨습니다.',
      content: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        accessToken,
        refreshToken,
      },
    };
  }

  private async validateUser(
    email: string,
    plainPassword: string,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && (await argon2.verify(user.password, plainPassword))) {
      return user;
    }
    throw new BusinessException(
      'auth',
      'invalid-credentials',
      'Invalid-credentials',
      HttpStatus.UNAUTHORIZED,
    );
  }

  createTokenPayload(userId: string): TokenPayload {
    return {
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      jti: uuidv4(),
    };
  }

  async createAccessToken(user: User, payload: TokenPayload): Promise<string> {
    const expiresIn = this.configService.get<string>('ACCESS_TOKEN_EXPIRY');
    const token = this.jwtService.sign(payload, { expiresIn });
    const expiresAT = this.calculateExpiry(expiresIn);

    await this.accessTokenRepository.saveAccessToken(
      payload.jti,
      user,
      token,
      expiresAT,
    );

    return token;
  }

  async createRefreshToken(user: User, payload: TokenPayload): Promise<string> {
    const expiresIn = this.configService.get<string>('REFRESH_TOKEN_EXPIRY');
    const token = this.jwtService.sign(payload, { expiresIn });
    const expiresAT = this.calculateExpiry(expiresIn);

    await this.refreshTokenRepository.saveRefreshToken(
      payload.jti,
      user,
      token,
      expiresAT,
    );

    return token;
  }

  private calculateExpiry(expiry: string): Date {
    let expiresInMilliseconds = 0;

    if (expiry.endsWith('d')) {
      const days = parseInt(expiry.slice(0, -1), 10);
      expiresInMilliseconds = days * 24 * 60 * 60 * 1000;
    } else if (expiry.endsWith('h')) {
      const hours = parseInt(expiry.slice(0, -1), 10);
      expiresInMilliseconds = hours * 60 * 60 * 1000;
    } else if (expiry.endsWith('m')) {
      const minutes = parseInt(expiry.slice(0, -1), 10);
      expiresInMilliseconds = minutes * 60 * 1000;
    } else if (expiry.endsWith('s')) {
      const seconds = parseInt(expiry.slice(0, -1), 10);
      expiresInMilliseconds = seconds * 1000;
    } else {
      throw new BusinessException(
        'auth',
        'invalid-expiry',
        'Invalid expiry time',
        HttpStatus.BAD_REQUEST,
      );
    }

    return new Date(Date.now() + expiresInMilliseconds);
  }
}
