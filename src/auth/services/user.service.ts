import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '../repositories';
import { SignupReqDto } from '../dto';
import { User } from '../entities';
import * as argon2 from 'argon2';
// import { BusinessException } from 'src/exception';
import { BusinessException } from '../../exception';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly userRepository: UserRepository) {}

  // for test
  testHello(): string {
    return 'test Hello';
  }

  async signup(singupReqDto: SignupReqDto): Promise<User> {
    const user = await this.userRepository.findOneByEmail(singupReqDto.email);
    if (user) {
      // this.logger.error(
      //   HttpStatus.BAD_REQUEST,
      //   `${singupReqDto.email} already exists in log`,
      // );
      throw new BusinessException(
        'user',
        `Email ${singupReqDto.email} already exist`,
        `${singupReqDto.email} already exist, this message for users`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const hashedPassword = await argon2.hash(singupReqDto.password);

    this.logger.log(
      `사용자 ${singupReqDto.email}(${user.id})가 로그인 했습니다.`,
    );

    return this.userRepository.signup(singupReqDto, hashedPassword);
  }
}
