
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';

@Entity()
export class Prescription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Doctor, doctor => doctor.prescriptions, { eager: false, onDelete: 'SET NULL' })
  doctor: Doctor;

  @ManyToOne(() => Patient, patient => patient.prescriptions, { eager: false, onDelete: 'SET NULL' })
  patient: Patient;

  @Column()
  diagnosis: string;

  @Column('text')
  medication: string;

  @Column({ nullable: true })
  dosageInstructions?: string;

  @CreateDateColumn()
  createdAt: Date;
}
