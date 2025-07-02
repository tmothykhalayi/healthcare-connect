import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';
import { Users } from '../../users/entities/user.entity';

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
  
  @ApiProperty({ description: 'Pharmacy status (active, inactive, temporarily_closed)' })
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
}
