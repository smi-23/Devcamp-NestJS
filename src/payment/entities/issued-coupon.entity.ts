import { BaseEntity } from '../../common/entities';
import { Column, Entity } from 'typeorm';

@Entity()
export class IssuedCoupon extends BaseEntity {
  @Column({ type: 'boolean', default: false })
  isValid: boolean;

  @Column({ type: 'boolean', default: false })
  isUsed: boolean;

  @Column({ type: 'timestamp', nullable: false })
  validFrom: Date; // 언제부터 유효한지

  @Column({ type: 'timestamp', nullable: false })
  validUntil: Date; // 언제까지 유효한지

  @Column({ type: 'timestamp', nullable: true })
  usedAt: Date;

  use() {
    this.isUsed = true;
    this.isValid = false;
    this.usedAt = new Date();
  }
}
