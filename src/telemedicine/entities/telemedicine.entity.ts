import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Patient } from '../../patients/entities/patient.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';

@Entity('telemedicine_appointments')
export class TelemedicineAppointment {
  @ApiProperty({ description: 'Telemedicine appointment unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Patient ID' })
  @Column()
  patientId: number;

  @ApiProperty({ description: 'Patient entity' })
  @ManyToOne(() => Patient, { eager: true })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @ApiProperty({ description: 'Doctor ID' })
  @Column()
  doctorId: number;

  @ApiProperty({ description: 'Doctor entity' })
  @ManyToOne(() => Doctor, { eager: true })
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @ApiProperty({ description: 'Appointment date' })
  @Column('date')
  appointmentDate: Date;

  @ApiProperty({ description: 'Appointment time' })
  @Column()
  appointmentTime: string;

  @ApiProperty({ description: 'Duration in minutes' })
  @Column({ default: 30 })
  duration: number;

  @ApiProperty({ description: 'Appointment status' })
  @Column({ default: 'scheduled' })
  status: string;

  @ApiProperty({ description: 'Additional notes' })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({ description: 'Video call URL' })
  @Column({ nullable: true })
  videoCallUrl: string;

  @ApiProperty({ description: 'Meeting ID for video call' })
  @Column({ nullable: true })
  meetingId: string;

  @ApiProperty({ description: 'Appointment creation date' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Appointment last update date' })
  @UpdateDateColumn()
  updatedAt: Date;
}
