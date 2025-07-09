import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Pharmacy } from '../../pharmacy/entities/pharmacy.entity';
import { Users } from '../../users/entities/user.entity';


@Entity('pharmacists')
export class Pharmacist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  licenseNumber: string;

  // Pharmacist works at one Pharmacy
  @ManyToOne(() => Pharmacy, (pharmacy) => pharmacy.pharmacists)
  pharmacy: Pharmacy;

  // One-to-one with User
  @OneToOne(() => Users, (user) => user.pharmacist)
  @JoinColumn()
  user: Users;
}
