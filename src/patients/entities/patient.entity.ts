
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  ManyToOne, JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';

import { Users } from '../../users/entities/user.entity'; // Adjust path as needed

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phoneNumber: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  
  @OneToMany(() => Order, (order) => order.patient)
  orders: Order[];

  // *** UPDATED: add relation to Users entity ***
  @ManyToOne(() => Users, { eager: true })
  @JoinColumn({ name: 'userId' }) // FK column name in 'patients' table
  user: Users;

  @Column()
  address: string;

  @Column({ type: 'date' })
  dateOfBirth: string;

  @Column({ nullable: true, type: 'text' })
  medicalHistory?: string;
}
