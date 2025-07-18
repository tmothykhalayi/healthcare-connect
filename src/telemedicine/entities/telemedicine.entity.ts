import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Users } from '../../users/entities/user.entity';
import { Appointment } from '../../appointments/entities/appointment.entity'; // if you want appointments relationship
import { Doctor } from '../../doctors/entities/doctor.entity';
import { Patient } from '../../patients/entities/patient.entity';

@Entity('telemedicine_appointments')
export class TelemedicineAppointment {
  @ApiProperty({ description: 'Telemedicine appointment ID' })
  @PrimaryGeneratedColumn()
  id: number;

  appointmentTime: string;
  notes?: string;

  duration?: number;
  @ApiProperty({ description: 'Doctor for the telemedicine appointment' })
  @ManyToOne(() => Doctor, (doctor) => doctor.appointments, { nullable: false })
  doctor: Doctor;

  @ApiProperty({ description: 'Patient for the telemedicine appointment' })
  @ManyToOne(() => Patient, (patient) => patient.telemedicineAppointments, {
    nullable: false,
  })
  patient: Patient;

  @ApiProperty({ description: 'Scheduled date and time' })
  @Column({ type: 'timestamp' })
  scheduledAt: Date;

  @ApiProperty({ description: 'Status (scheduled, completed, canceled, etc.)' })
  @Column({ default: 'scheduled' })
  status: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;

  order: {
    scheduledAt: 'ASC';
  };
}
