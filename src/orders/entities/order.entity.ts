import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Patient } from '../../patients/entities/patient.entity';
import { Pharmacy } from '../../pharmacy/entities/pharmacy.entity';
import { Payment } from '../../payments/entities/payment.entity';


@Entity('orders')
export class Order {
  @ApiProperty({ description: 'Order unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Patient ID associated with the order' })
  @Column()
  patientId: number;

  @ApiProperty({ description: 'Patient associated with this order' })
  @ManyToOne(() => Patient, (patient) => patient.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @ApiProperty({ description: 'Pharmacy ID associated with the order' })
  @Column()
  pharmacyId: number;

  @ApiProperty({ description: 'Pharmacy associated with this order' })
  @ManyToOne(() => Pharmacy, (pharmacy) => pharmacy.orders)
  @JoinColumn({ name: 'pharmacyId' })
  pharmacy: Pharmacy;

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

  @OneToMany(() => Payment, (payment) => payment.order, { eager: true })
  payments: Payment[];

}
