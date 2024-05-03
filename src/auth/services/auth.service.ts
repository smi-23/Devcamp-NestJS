import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  AccessLogRepository,
  AccessTokenRepository,
  RefreshTokenRepository,
  UserRepository,
} from '../repositories';
import { User } from '../entities';
import * as argon2 from 'argon2';
import { BusinessException } from '../../exception';
import { LoginResDto } from '../dto/login-res.dto';
import { AccessLog, TokenPayload } from '../dto';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenBlacklistService } from './token-blacklist.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly accessTokenRepository: AccessTokenRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly accessLogRepository: AccessLogRepository,
    private readonly configService: ConfigService,
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) {}

  async login(
    email: string,
    plainPassword: string,
    req: AccessLog,
  ): Promise<{ message: string; content: LoginResDto }> {
    const user = await this.validateUser(email, plainPassword);
    const paylaod: TokenPayload = this.createTokenPayload(user.id); // 함수의 매개변수에는 타입정보를 입력하지 않습니다.

    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken(user, paylaod),
      this.createRefreshToken(user, paylaod),
    ]);

    const { ua, endpoint, ip } = req;
    await this.accessLogRepository.createAccessLog(user, ua, endpoint, ip);

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

  async logout(accessToken: string, refreshToken: string): Promise<void> {
    const [jtiAccess, jtiRefresh] = await Promise.all([
      this.jwtService.verifyAsync(accessToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      }),
      this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      }),
    ]);
    await Promise.all([
      this.addToBlacklist(
        accessToken,
        jtiAccess,
        'access',
        'ACCESS_TOKEN_EXPIRY',
      ),
      this.addToBlacklist(
        refreshToken,
        jtiRefresh,
        'refresh',
        'REFRESH_TOKEN_EXPIRY',
      ),
    ]);
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
    this.logger.log(`Access토큰의 만료시간은 ${expiresIn}입니다.`);
    // const expiresIn = '3600s';

    const token = this.jwtService.sign(payload, { expiresIn });
    const expiresAt = this.calculateExpiry(expiresIn);

    await this.accessTokenRepository.saveAccessToken(
      payload.jti,
      user,
      token,
      expiresAt,
    );

    return token;
  }

  async createRefreshToken(user: User, payload: TokenPayload): Promise<string> {
    const expiresIn = this.configService.get<string>('REFRESH_TOKEN_EXPIRY');
    this.logger.log(`Refresh토큰의 만료시간은 ${expiresIn}입니다.`);
    // const expiresIn = "3600s"; .env파일의 만료시간에 s를 붙여서 해결 인자를 string으로 받고 그것을 필요에 따라 parsing하기 때문

    const token = this.jwtService.sign(payload, { expiresIn });
    const expiresAt = this.calculateExpiry(expiresIn);

    await this.refreshTokenRepository.saveRefreshToken(
      payload.jti,
      user,
      token,
      expiresAt,
    );

    return token;
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const abc = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      this.logger.log(`내가 알고 싶은 값: ${JSON.stringify(abc)}`);
      const { exp, ...payload } = abc;
      // const { exp, ...payload } = await this.jwtService.verifyAsync(
      //   refreshToken,
      //   {
      //     secret: this.configService.get<string>('JWT_SECRET'),
      //   },
      // )

      const user = await this.userRepository.findOneBy({ id: payload.sub });
      if (!user) {
        throw new BusinessException(
          'auth',
          'user-not-found',
          'User not found',
          HttpStatus.UNAUTHORIZED,
        );
      }

      return this.createAccessToken(user, payload as TokenPayload);
    } catch (error) {
      throw new BusinessException(
        'auth',
        'invalid-refresh-token',
        'Invalid refresh token',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  private calculateExpiry(expiry: string): Date {
    let expiresInMilliseconds = 0;

    const time = parseInt(expiry.slice(0, -1), 10);

    if (expiry.endsWith('d')) {
      expiresInMilliseconds = time * 24 * 60 * 60 * 1000; // day
    } else if (expiry.endsWith('h')) {
      expiresInMilliseconds = time * 60 * 60 * 1000; // hours
    } else if (expiry.endsWith('m')) {
      expiresInMilliseconds = time * 60 * 1000; // minutes
    } else if (expiry.endsWith('s')) {
      expiresInMilliseconds = time * 1000; //
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

  private async addToBlacklist(
    token: string,
    jti: string,
    type: 'access' | 'refresh',
    expiryConfigKey: string,
  ): Promise<void> {
    const expiryTime = this.calculateExpiry(
      this.configService.get<string>(expiryConfigKey),
    );
    await this.tokenBlacklistService.addToBlacklist(
      token,
      jti,
      type,
      expiryTime,
    );
  }
}
