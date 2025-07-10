import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Users } from '../../users/entities/user.entity';
import { Pharmacy } from 'src/pharmacy/entities/pharmacy.entity';
import { Order } from 'src/orders/entities/order.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ nullable: true })
  pharmacyId: number;

  @Column()
  orderId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  paymentMethod: string;

  @Column()
  status: 'pending' | 'completed' | 'failed' | 'refunded';

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

  // Relations
  @ManyToOne(() => Users, (user) => user.payments)
  @JoinColumn({ name: 'userId' })
  user: Users;

  @ManyToOne(() => Pharmacy, (pharmacy) => pharmacy.payments, { eager: true, nullable: true })
  @JoinColumn({ name: 'pharmacyId' })
  pharmacy: Pharmacy;

  @ManyToOne(() => Order, (order) => order.payments, { nullable: false })
  @JoinColumn({ name: 'orderId', referencedColumnName: 'OrderId' })
  order: Order;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
