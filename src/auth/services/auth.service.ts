import { HttpStatus, Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories';
import { User } from '../entities';
import * as argon2 from 'argon2';
import { BusinessException } from 'src/exception';
import { LoginResDto } from '../dto/login-res.dto';

@Injectable()
export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async login(
    email: string,
    plainPassword: string,
  ): Promise<{ message: string; content: LoginResDto }> {
    const user = await this.validateUser(email, plainPassword);
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
}
