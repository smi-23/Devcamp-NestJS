import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from '../services';
import { SignupReqDto, SignupResDto } from '../dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UserService) {}

  @Get()
  testHello(): string {
    return this.userService.testHello();
  }

  @Post('signup')
  async signup(
    @Body() signupReqDto: SignupReqDto,
  ): Promise<{ message: string; content: SignupResDto }> {
    const userInfo = await this.userService.signup(signupReqDto);
    return {
      message: '회원가입에 성공하셨습니다.',
      content: {
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone,
        role: userInfo.role,
      },
    };
  }
}
