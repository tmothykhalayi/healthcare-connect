import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { Patient } from '../../patients/entities/patient.entity';
import { Pharmacist } from '../../pharmacist/entities/pharmacist.entity';
import { Medicine } from '../../medicines/entities/medicine.entity';

@Entity()
export class Prescription {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Doctor, (doctor) => doctor.prescriptions, { eager: true })
  doctor: Doctor;

  @ManyToOne(() => Patient, (patient) => patient.prescriptions, { eager: true })
  patient: Patient;

  @ManyToOne(() => Pharmacist, (pharmacist) => pharmacist.prescriptions, {
    nullable: true,
    eager: true,
  })
  pharmacist?: Pharmacist;

  @ManyToMany(() => Medicine, { eager: true })
  @JoinTable()
  medicines: Medicine[];

  @Column()
  issueDate: Date;

  @Column({ nullable: true })
  fulfilledDate?: Date;
}
