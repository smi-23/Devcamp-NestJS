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

  @Post('logout')
  async logout(
    @Body() body: { accessToken: string; refreshToken: string },
  ): Promise<{ message: string }> {
    const { accessToken, refreshToken } = body;
    await this.authService.logout(accessToken, refreshToken);
    return { message: '로그아웃 되었습니다.' };
  }

  @Post('refresh')
  async refresh(
    @Body() refreshTokenReqDto: RefreshTokenReqDto,
  ): Promise<string> {
    return this.authService.refreshAccessToken(refreshTokenReqDto.refreshToken);
  }
}
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1MzkzYzkwNi00YzljLTQxZDItYTA2Yy1jZGRiMzQ5MGM5NjAiLCJpYXQiOjE3MTQwNDU0OTEsImp0aSI6ImMwZjIxMDJlLTdjNGItNDA5My1hZGE0LTQzNjAyMWE0MDM4ZSIsImV4cCI6MTcxNDEzMTg5MX0.wwfVcjxLXg2JXaP8ViL5C6Imk8f99q5hE2B1z5XUnWo