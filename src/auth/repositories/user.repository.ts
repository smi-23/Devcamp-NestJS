import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { SignupReqDto } from '../dto';

@Injectable()
export class UserRepository extends Repository<User> {
  // 데이터베이스와 상호작용
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  async findOneByEmail(email: string): Promise<User> {
    return this.repo.findOneBy({ email });
  }

  async signup(dto: SignupReqDto, hashedPassword: string): Promise<User> {
    const user = new User();
    user.name = dto.name;
    user.email = dto.email;
    user.password = hashedPassword;
    user.phone = dto.phone;
    user.role = dto.role;
    return this.repo.save(user);
  }
}
