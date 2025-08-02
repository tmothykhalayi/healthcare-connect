import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Users } from '../../users/entities/user.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { Medicine } from '../../medicines/entities/medicine.entity';
import { Order } from '../../orders/entities/order.entity';

import { Prescription } from '../../prescriptions/entities/prescription.entity';
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Entity('patients')
export class Patient {
  @Column({ nullable: true })
  name: string;

  @OneToMany(() => Prescription, (prescription) => prescription.patient)
  prescriptions: Prescription[];

  @ApiProperty({ description: 'Patient unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'User ID (from users table)' })
  @Column({ unique: true })
  userId: number;

  @ApiProperty({ description: 'User associated with this patient' })
  @OneToOne(() => Users, (user) => user.patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Users;

  @ApiProperty({ description: 'Patient gender', enum: Gender })
  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender;

  @ApiProperty({ description: 'Patient date of birth' })
  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @ApiProperty({ description: 'Patient phone number' })
  @Column({ nullable: true })
  phoneNumber: string;

  @ApiProperty({ description: 'Patient address' })
  @Column({ type: 'text', nullable: true })
  address: string;

  @ApiProperty({ description: 'Emergency contact information' })
  @Column({ type: 'text', nullable: true })
  emergencyContact: string;

  @ApiProperty({ description: 'Medical history' })
  @Column({ type: 'text', nullable: true })
  medicalHistory: string;

  @ApiProperty({ description: 'List of allergies (JSON array)' })
  @Column({ type: 'json', nullable: true })
  allergies: string[];

  @ApiProperty({ description: 'Assigned doctor ID' })
  @Column({ nullable: true })
  assignedDoctorId: number;

  @ApiProperty({ description: 'Assigned doctor' })
  @ManyToOne(() => Doctor, (doctor) => doctor.patients, { nullable: true })
  @JoinColumn({ name: 'assignedDoctorId' })
  assignedDoctor: Doctor;

  @ApiProperty({ description: 'Blood type' })
  @Column({ nullable: true })
  bloodType: string;

  @ApiProperty({ description: 'Weight in kg' })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight: number;

  @ApiProperty({ description: 'Height in cm' })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height: number;

  @ApiProperty({ description: 'Patient status' })
  @Column({ default: 'pending_profile_completion' })
  status: string;

  @ApiProperty({ description: 'Last visit date' })
  @Column({ type: 'timestamp', nullable: true })
  lastVisit: Date;

  @ApiProperty({ description: 'Patient creation date' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Patient last update date' })
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany('Appointment', 'patient')
  appointments: any[];

  @OneToMany('Medical', 'patient')
  medicalRecords: any[];

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @OneToMany(() => Order, (order) => order.patient)
  orders: Order[];
}
