import { Entity, Column, PrimaryGeneratedColumn,
  OneToMany , CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Payment } from '../../payments/entities/payment.entity';

export enum UserRole {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  PATIENT = 'patient',
  PHARMACY = 'pharmacy'
}

@Entity('users')
export class Users {
  @ApiProperty({ description: 'User unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;
  
  @ApiProperty({ description: 'User email address' })
  @Column({ unique: true })
  email: string;
  
  @ApiProperty({ description: 'User password (hashed)' })
  @Column()
  password: string;
  
  @ApiProperty({ description: 'User first name' })
  @Column()
  firstName: string;
  
  @ApiProperty({ description: 'User last name' })
  @Column()
  lastName: string;
  
  @ApiProperty({ description: 'User phone number', required: false })
  @Column({ nullable: true })
  phoneNumber: string;
  
  @ApiProperty({ description: 'User role', enum: UserRole })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PATIENT
  })
  role: UserRole;
  
  @ApiProperty({ description: 'Email verification status' })
  @Column({ default: false })
  isEmailVerified: boolean;
  
  @ApiProperty({ description: 'Account active status' })
  @Column({ default: true })
  isActive: boolean;
  
  @ApiProperty({ description: 'Hashed refresh token for JWT authentication' })
  @Column({ nullable: true })
  hashedRefreshToken: string;
  
  @ApiProperty({ description: 'User last login date' })
  @Column({ nullable: true, type: 'timestamp' })
  lastLogin: Date;
  
  @ApiProperty({ description: 'User creation date' })
  @CreateDateColumn()
  createdAt: Date;
  
  @ApiProperty({ description: 'User last update date' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'OTP for password reset', required: false })
  @Column({ nullable: true })
  otp: string;

  @ApiProperty({ description: 'OTP secret for verification', required: false })
  @Column({ nullable: true })
  secret: string;

  @ApiProperty({ description: 'OTP expiry time', required: false })
  @Column({ nullable: true, type: 'timestamp' })
  otpExpiry: Date;

   @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];
}