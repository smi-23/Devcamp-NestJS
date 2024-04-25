import { BaseEntity } from '../../common/entities';
import { Column, Entity, ManyToOne, Relation } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class RefreshToken extends BaseEntity {
  @Column()
  jti: string; // jwt토큰의 고유 식별자

  @Column()
  token: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ default: false })
  isRevoked: boolean; // 폐기되었는지

  @ManyToOne(() => User) // 이런 방식은 단방향을 표현
  user: Relation<User>;
}
