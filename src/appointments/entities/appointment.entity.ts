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
import { Patient } from '../../patients/entities/patient.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';

@Entity('appointments')
export class Appointment {
  @ApiProperty({ description: 'Appointment unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Patient ID' })
  @Column()
  patientId: number;

  @ApiProperty({ description: 'Doctor ID' })
  @Column()
  doctorId: number;

  @ApiProperty({ description: 'Appointment date and time' })
  @Column({ type: 'timestamp' })
  appointmentDate: Date;

  @ApiProperty({ description: 'Appointment time (HH:MM format)' })
  @Column()
  appointmentTime: string;

  @ApiProperty({ description: 'Duration in minutes' })
  @Column()
  duration: number;

  @ApiProperty({ description: 'Reason for appointment' })
  @Column()
  reason: string;

  @ApiProperty({ description: 'Appointment status' })
  @Column({ default: 'scheduled' })
  status: string;

  @ApiProperty({ description: 'Appointment priority' })
  @Column({ default: 'normal' })
  priority: string;

  @ApiProperty({ description: 'Parent appointment ID for follow-ups' })
  @Column({ nullable: true })
  parentAppointmentId: number;

  @ApiProperty({ description: 'General notes' })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({ description: 'Medical notes' })
  @Column({ type: 'text', nullable: true })
  medicalNotes: string;

  @ApiProperty({ description: 'Cancellation reason' })
  @Column({ nullable: true })
  cancellationReason: string;

  @ApiProperty({ description: 'Reschedule reason' })
  @Column({ nullable: true })
  rescheduleReason: string;

  @ApiProperty({ description: 'Diagnosis' })
  @Column({ type: 'text', nullable: true })
  diagnosis: string;

  @ApiProperty({ description: 'Prescription' })
  @Column({ type: 'text', nullable: true })
  prescription: string;

  @ApiProperty({ description: 'Vital signs (JSON)' })
  @Column({ type: 'json', nullable: true })
  vitals: any;
  @ApiProperty({ description: 'Patient email' })
  @Column({ nullable: true })
  patientEmail: string;

  //   @Column({ nullable: true })
  // doctorName: string;

  @ApiProperty({ description: 'Appointment creation date' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Appointment last update date' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Patient, (patient) => patient.appointments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @ManyToOne(() => Doctor, (doctor) => doctor.appointments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @Column({ nullable: true })
  zoomMeetingId?: string;

  @ApiProperty({
    description: 'Zoom meeting URL for the appointment for the user(patient',
    example: 'https://zoom.us/j/123456789',
    required: false,
  })
  @Column({ nullable: true })
  user_url?: string;

  @ApiProperty({
    description: 'Zoom meeting URL for the appointment for the admin',
    example: 'https://zoom.us/s/123456789',
    required: false,
  })
  @Column({ nullable: true })
  admin_url?: string;
}
