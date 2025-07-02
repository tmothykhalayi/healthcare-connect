
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Users } from '../../users/entities/user.entity';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => Users, (user) => user.payments)
  user: Users;

  @Column('decimal')
  amount: number;

  @Column()
  paymentMethod: string;

  @Column({ type: 'enum', enum: ['pending', 'completed', 'failed', 'refunded'] })
  status: 'pending' | 'completed' | 'failed' | 'refunded';

  @Column()
  relatedEntityType: string;

  @Column()
  relatedEntityId: string;

  @Column()
  transactionId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
