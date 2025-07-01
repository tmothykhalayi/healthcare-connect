import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';
import { Patient } from '../../patients/entities/patient.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';

export enum UserRole {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  PATIENT = 'patient',
  PHARMACY = 'pharmacy',
}

@Entity('users')
export class Users {
  @ApiProperty({ description: 'User unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;
  
  @ApiProperty({ description: 'User email address' })
  @Column({ unique: true })
  email: string;
  
  @ApiProperty({ description: 'User first name' })
  @Column()
  firstName: string;
  
  @ApiProperty({ description: 'User last name' })
  @Column()
  lastName: string;
  
  @ApiProperty({ enum: UserRole, description: 'User role' })
  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;
  
  @ApiProperty({ description: 'Email verification status' })
  @Column({ default: false })
  isEmailVerified: boolean;
  
  @ApiProperty({ description: 'User password (hashed)' })
  @Column({ select: false })
  password: string;

  @ApiProperty({ description: 'Patient profile if user is a patient' })
  @OneToOne(() => Patient, patient => patient.user)
  patient: Patient;

  @ApiProperty({ description: 'Doctor profile if user is a doctor' })
  @OneToOne(() => Doctor, doctor => doctor.user)
  doctor: Doctor;
  
  @ApiProperty({ description: 'User creation date' })
  @CreateDateColumn()
  createdAt: Date;
  
  @ApiProperty({ description: 'User last update date' })
  @UpdateDateColumn()
  updatedAt: Date;
}