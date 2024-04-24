import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  testHello(): string {
    return 'test Hello';
  }
}
