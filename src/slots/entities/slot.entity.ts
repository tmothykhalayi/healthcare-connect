import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';

@Entity()
export class Slot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: string; // e.g., '2025-08-01'

  @Column({ type: 'time' })
  startTime: string; // e.g., '14:30'

  @Column({ type: 'time' })
  endTime: string; // e.g., '15:00'

  @Column({ default: false })
  isBooked: boolean;

  @ManyToOne(() => Doctor, (doctor) => doctor.slots, { eager: true })
  doctor: Doctor;

  @OneToOne(() => Appointment, (appointment) => appointment.slot, { nullable: true })
  appointment: Appointment;

 
  time: string; 
  @Column({ default: true })
  isAvailable: boolean; 

}

