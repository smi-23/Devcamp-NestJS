import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '../repositories';
import { User } from '../entities';
import * as argon2 from 'argon2';
import { BusinessException } from 'src/exception';
import { LoginResDto } from '../dto/login-res.dto';
import { TokenPayload } from '../dto';
import { v4 as uuidv4 } from 'uuid';


@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly userRepository: UserRepository) {}

  async login(
    email: string,
    plainPassword: string,
  ): Promise<{ message: string; content: LoginResDto }> {
    const user = await this.validateUser(email, plainPassword);

    this.logger.log(`사용자 ${email}(${user.id})가 로그인 했습니다.`);

    return {
      message: '로그인에 성공하셨습니다.',
      // acessToken,
      // refreshToken,
      content: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
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
}
