import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from '../services';
import { SignupReqDto, SignupResDto } from '../dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UserService, private readonly singupResDto: SignupResDto) {}

  @Get()
  testHello(): string {
    return this.userService.testHello();
  }

  @Post('sighup')
  async signup(@Body() signupReqDto: SignupReqDto): Promise<SignupReqDto> {
    const user = await this.userService.signup(signupReqDto);
    return user;
  }
}
