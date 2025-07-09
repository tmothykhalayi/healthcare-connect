import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Patient } from '../../../patients/entities/patient.entity';
import { Doctor } from '../../../doctors/entities/doctor.entity';
import { Order } from '../../../orders/entities/order.entity';

@Entity('medical_records')
export class Medical {
  @ApiProperty({ description: 'Medical record unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Patient ID' })
  @Column()
  patientId: number;

  @ApiProperty({ description: 'Patient associated with this record' })
  @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @ApiProperty({ description: 'Doctor ID who created the record' })
  @Column()
  doctorId: number;

  @ApiProperty({ description: 'Doctor associated with this record' })
  @ManyToOne(() => Doctor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @ApiProperty({ description: 'Appointment ID (if related to appointment)' })
  @Column({ nullable: true })
  appointmentId: number;

  @ApiProperty({ description: 'Appointment associated with this record' })
  @ManyToOne('Appointment', { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'appointmentId' })
  appointment: any;

  @ApiProperty({
    description: 'Record type (diagnosis, prescription, lab_result, etc.)',
  })
  @Column()
  recordType: string;

  @ApiProperty({ description: 'Record title/summary' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Detailed description of the record' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ description: 'Diagnosis information' })
  @Column({ type: 'text', nullable: true })
  diagnosis: string;

  @ApiProperty({ description: 'Treatment prescribed' })
  @Column({ type: 'text', nullable: true })
  treatment: string;

  @ApiProperty({ description: 'Medications prescribed' })
  @Column({ type: 'json', nullable: true })
  medications: any;

  @ApiProperty({ description: 'Lab results (JSON)' })
  @Column({ type: 'json', nullable: true })
  labResults: any;

  @ApiProperty({ description: 'Vital signs recorded' })
  @Column({ type: 'json', nullable: true })
  vitals: any;

  @ApiProperty({ description: 'Allergies noted' })
  @Column({ type: 'json', nullable: true })
  allergies: any;

  @ApiProperty({ description: 'Follow-up instructions' })
  @Column({ type: 'text', nullable: true })
  followUpInstructions: string;

  @ApiProperty({ description: 'Next appointment date' })
  @Column({ type: 'timestamp', nullable: true })
  nextAppointmentDate: Date;

  @ApiProperty({ description: 'Record priority (normal, urgent, critical)' })
  @Column({ default: 'normal' })
  priority: string;

  @ApiProperty({ description: 'Record status (active, archived, deleted)' })
  @Column({ default: 'active' })
  status: string;

  @ApiProperty({ description: 'Additional notes' })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({ description: 'Attachments/documents (JSON)' })
  @Column({ type: 'json', nullable: true })
  attachments: any;

  @ApiProperty({ description: 'Record creation date' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Record last update date' })
  @UpdateDateColumn()
  updatedAt: Date;
}
