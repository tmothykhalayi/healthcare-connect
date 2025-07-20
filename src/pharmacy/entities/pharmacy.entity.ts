import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Users } from '../../users/entities/user.entity';
import { Medicine } from '../../medicines/entities/medicine.entity';
import { Order } from '../../orders/entities/order.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Pharmacist } from '../../pharmacist/entities/pharmacist.entity';
import { PharmacyMedicine } from './pharmacy-medicine.entity';

@Entity('pharmacies')
export class Pharmacy {
  @ApiProperty({ description: 'Pharmacy unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'User ID (from users table)' })
  @Column({ unique: true })
  userId: number;

  @ApiProperty({ description: 'User associated with this pharmacy' })
  @OneToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Users;

  @ApiProperty({ description: 'Pharmacy name' })
  @Column()
  pharmacyName: string;

  @ApiProperty({ description: 'Pharmacy license number' })
  @Column({ unique: true })
  licenseNumber: string;

  @ApiProperty({ description: 'Pharmacy phone number' })
  @Column()
  phoneNumber: string;

  @ApiProperty({ description: 'Pharmacy address' })
  @Column()
  address: string;

  @ApiProperty({ description: 'Pharmacy email' })
  @Column({ nullable: true })
  email: string;

  @ApiProperty({ description: 'Pharmacy opening hours' })
  @Column({ default: '9:00 AM - 6:00 PM' })
  openingHours: string;

  @ApiProperty({ description: 'Services offered (JSON array)' })
  @Column({ type: 'json', default: '[]' })
  services: string[];

  @ApiProperty({ description: 'Delivery available' })
  @Column({ default: false })
  deliveryAvailable: boolean;

  @ApiProperty({ description: 'Online ordering available' })
  @Column({ default: false })
  onlineOrderingAvailable: boolean;

  @ApiProperty({ description: 'Insurance plans accepted (JSON array)' })
  @Column({ type: 'json', nullable: true })
  insurancePlansAccepted: string[];

  @ApiProperty({
    description: 'Pharmacy status (active, inactive, temporarily_closed)',
  })
  @Column({ default: 'active' })
  status: string;

  @ApiProperty({ description: 'Additional notes' })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({ description: 'Pharmacy creation date' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Pharmacy last update date' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Many-to-many relation with Medicine entity
  @ManyToMany(() => Medicine, (medicine) => medicine.pharmacies)
  medicines: Medicine[];

  // One-to-many relation with PharmacyMedicine entity
  @OneToMany(() => PharmacyMedicine, (pharmacyMedicine) => pharmacyMedicine.pharmacy)
  pharmacyMedicines: PharmacyMedicine[];

  @OneToMany(() => Order, (order) => order.pharmacy)
  orders: Order[];

  @OneToMany(() => Payment, (payment) => payment.pharmacy)
  payments: Payment[];

  @Column()
  name: string;

  // One Pharmacy has many Pharmacists
  @OneToMany(() => Pharmacist, (pharmacist) => pharmacist.pharmacy)
  pharmacists: Pharmacist[];
}
