import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';

@Entity('orders')
export class Order {
  @ApiProperty({ description: 'Order unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;
  
  @ApiProperty({ description: 'Patient ID associated with the order' })
  @Column()
  patientId: number;

  @ApiProperty({ description: 'Patient associated with this order' })
  @ManyToOne('Patient', 'orders', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patientId' })
  patient: any;
  
  @ApiProperty({ description: 'Date when the order was placed' })
  @Column({ type: 'timestamp' })
  orderDate: Date;
  
  @ApiProperty({ description: 'Current status of the order' })
  @Column()
  status: string;
  
  @ApiProperty({ description: 'Total amount for the order' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;
  
  @ApiProperty({ description: 'Custom Order ID' })
  @Column({ unique: true })
  OrderId: string;
  
  @ApiProperty({ description: 'Order creation date' })
  @CreateDateColumn()
  createdAt: Date;
  
  @ApiProperty({ description: 'Order last update date' })
  @UpdateDateColumn()
  updatedAt: Date;
}