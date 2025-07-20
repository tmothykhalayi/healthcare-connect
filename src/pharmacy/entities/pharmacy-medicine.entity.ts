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
import { Pharmacy } from './pharmacy.entity';
import { Medicine } from '../../medicines/entities/medicine.entity';

@Entity('pharmacy_medicine_stock')
export class PharmacyMedicine {
  @ApiProperty({ description: 'PharmacyMedicine unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Pharmacy ID' })
  @Column()
  pharmacyId: number;

  @ApiProperty({ description: 'Medicine ID' })
  @Column()
  medicineId: number;

  @ApiProperty({ description: 'Stock quantity for this medicine in this pharmacy' })
  @Column({ default: 0 })
  stockQuantity: number;

  @ApiProperty({ description: 'Minimum stock level for this medicine in this pharmacy' })
  @Column({ default: 10 })
  minimumStockLevel: number;

  @ApiProperty({ description: 'Price for this medicine in this pharmacy' })
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @ApiProperty({ description: 'Whether this medicine is available in this pharmacy' })
  @Column({ default: true })
  isAvailable: boolean;

  @ApiProperty({ description: 'Creation date' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Pharmacy, (pharmacy) => pharmacy.pharmacyMedicines)
  @JoinColumn({ name: 'pharmacyId' })
  pharmacy: Pharmacy;

  @ManyToOne(() => Medicine, (medicine) => medicine.pharmacyMedicines)
  @JoinColumn({ name: 'medicineId' })
  medicine: Medicine;
} 