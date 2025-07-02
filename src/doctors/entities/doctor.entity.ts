import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn ,OneToMany} from "typeorm";
import { ApiProperty } from '@nestjs/swagger';
import { Users } from '../../users/entities/user.entity';
import {Patient}from '../../patients/entities/patient.entity';

@Entity('doctors')
export class Doctor {
  @ApiProperty({ description: 'Doctor unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;
  
  @ApiProperty({ description: 'User ID (from users table)' })
  @Column({ unique: true })
  userId: number;

  @ApiProperty({ description: 'User associated with this doctor' })
  @OneToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Users;
  
  @ApiProperty({ description: 'Doctor specialization' })
  @Column()
  specialization: string;
  
  @ApiProperty({ description: 'Medical license number' })
  @Column({ unique: true })
  licenseNumber: string;
  
  @ApiProperty({ description: 'Years of experience' })
  @Column()
  yearsOfExperience: number;
  
  @ApiProperty({ description: 'Education/qualifications' })
  @Column({ type: 'text', nullable: true })
  education: string;
  
  @ApiProperty({ description: 'Doctor phone number' })
  @Column()
  phoneNumber: string;
  
  @ApiProperty({ description: 'Office address' })
  @Column()
  officeAddress: string;
  
  @ApiProperty({ description: 'Consultation fee' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  consultationFee: number;
  
  @ApiProperty({ description: 'Available days (JSON array)' })
  @Column({ type: 'json', nullable: true })
  availableDays: string[];
  
  @ApiProperty({ description: 'Available hours' })
  @Column({ nullable: true })
  availableHours: string;
  
  @ApiProperty({ description: 'Doctor status (active, inactive, on_leave)' })
  @Column({ default: 'active' })
  status: string;
  
  @ApiProperty({ description: 'Doctor creation date' })
  @CreateDateColumn()
  createdAt: Date;
  
  @ApiProperty({ description: 'Doctor last update date' })
  @UpdateDateColumn()
  updatedAt: Date;

  
@OneToMany(() => Patient, patient => patient.assignedDoctor)
  patients: Patient[];
}
