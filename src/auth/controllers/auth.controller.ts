import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthService, UserService } from '../services';
import {
  LoginReqDto,
  RefreshTokenReqDto,
  SignupReqDto,
  SignupResDto,
} from '../dto';
import { LoginResDto } from '../dto/login-res.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  // for tset
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

  @Post('login')
  async login(
    @Req() req,
    @Body() loginReqDto: LoginReqDto,
  ): Promise<{ message: string; content: LoginResDto }> {
    const { ip, method, originalUrl } = req;
    const reqInfo = {
      ip,
      endpoint: `${method} ${originalUrl}`, // ex) POST auth/login
      ua: req.headers['user-agent'] || '',
    };
    return this.authService.login(
      loginReqDto.email,
      loginReqDto.password,
      reqInfo,
    );
  }

  @Post('refresh')
  async refresh(
    @Body() refreshTokenReqDto: RefreshTokenReqDto,
  ): Promise<string> {
    return this.authService.refreshAccessToken(refreshTokenReqDto.refreshToken);
  }
}
