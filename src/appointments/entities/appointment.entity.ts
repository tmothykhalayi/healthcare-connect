import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';

@Entity('appointments')
export class Appointment {
  @ApiProperty({ description: 'Appointment unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;
  
  @ApiProperty({ description: 'Patient ID' })
  @Column()
  patientId: number;

  @ApiProperty({ description: 'Patient associated with this appointment' })
  @ManyToOne('Patient', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patientId' })
  patient: any;

  @ApiProperty({ description: 'Doctor ID' })
  @Column()
  doctorId: number;

  @ApiProperty({ description: 'Doctor associated with this appointment' })
  @ManyToOne('Doctor', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctorId' })
  doctor: any;
  
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
  
  @ApiProperty({ description: 'Appointment creation date' })
  @CreateDateColumn()
  createdAt: Date;
  
  @ApiProperty({ description: 'Appointment last update date' })
  @UpdateDateColumn()
  updatedAt: Date;
}
