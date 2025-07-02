import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Users } from '../../users/entities/user.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  paymentMethod: string;

  @Column()
  status: string;
  
  @Column({ nullable: true })
  transactionId: string;
  
  @Column({ nullable: true })
  relatedEntityType: string;
  
  @Column({ nullable: true })
  relatedEntityId: number;
  
  @Column({ nullable: true })
  description: string;

  @Column('json', { nullable: true })
  metadata: any;

  @ManyToOne(() => Users)
  @JoinColumn({ name: 'userId' })
  user: Users;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
