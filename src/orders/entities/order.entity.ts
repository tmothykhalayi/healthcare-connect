import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string; 

   @Column()
  OrderId: string; 

  @Column({ type: 'timestamp' })
  orderDate: Date;

  @Column({ type: 'enum', enum: ['pending', 'processed', 'shipped', 'delivered', 'cancelled'] })
  status: string;

  @Column('decimal')
  totalAmount: number;



  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
