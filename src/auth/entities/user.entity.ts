import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../common/entities';

export type UserRole = 'admin' | 'user';

@Entity()
export class User extends BaseEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', length: 50 })
  phone: string;

  @Column({ type: 'varchar' })
  role: UserRole;

  // @Column({ nullable: true })
  // regNo: string;

  // @Column({ default: false })
  // isPersonalInfoVerified: boolean;
}
