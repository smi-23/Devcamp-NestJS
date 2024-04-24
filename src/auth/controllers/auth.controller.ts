import { Controller, Get } from '@nestjs/common';
import { UserService } from '../services';

@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UserService) {}

  @Get()
  testHello(): string {
    return this.userService.testHello();
  }
}
