import { Module } from '@nestjs/common';
import { UserService } from './services';
import { AuthController } from './controllers';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [UserService],
  exports: [UserService],
})
export class AuthModule {}
